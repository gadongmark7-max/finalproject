import mongoose, { ClientSession, isValidObjectId } from "mongoose";
import BookingModel from "../model/booking.model";
import ExpencesModel from "../model/expences.model";
import { isWholeNumberUnit } from "../model/inventory.model";
import { InventoryService } from "./inventory.service";
import { InventoryLogService } from "./inventoryLog.service";
import { AccountService } from "./acccount.service";
import { getDate, getTime } from "../utils/customFunction";
import { SessionMaterialInput } from "../validation/booking.schema";

const ACTIVE_STATUSES = ["active"];

export class BookingCompletionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface ConsumedItem {
  itemId: string;
  item: string;
  unit?: string;
  qty: number;
  deducted: number;
  unitCost: number;
  cost: number;
  missing: boolean;
}

export type BookingActor = { id: string; name: string };

type BookingDoc = InstanceType<typeof BookingModel>;

type UndoStep = () => Promise<unknown>;

const round2 = (n: number) => Math.round(n * 100) / 100;

const PAID_TOLERANCE = 0.005;

export const isFullyPaid = (balance: unknown) =>
  Number(balance) < PAID_TOLERANCE;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isSessionRecorded = (
  booking: { sessionUsage?: { session: number }[] | null },
  session: number,
) => (booking.sessionUsage ?? []).some((u) => u.session === session);

export const sessionsPerformed = (booking: {
  status: string;
  session: number;
  sessionUsage?: { session: number }[] | null;
}) => {
  if (booking.status === "pending" || booking.status === "appointment") {
    return 0;
  }
  return isSessionRecorded(booking, booking.session)
    ? booking.session
    : Math.max(0, booking.session - 1);
};

let transactionsSupported: boolean | null = null;

async function supportsTransactions() {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const hello = await mongoose.connection.db!.admin().command({ hello: 1 });
    transactionsSupported = !!hello.setName || hello.msg === "isdbgrid";
  } catch {
    transactionsSupported = false;
  }
  return transactionsSupported;
}

async function runAtomically<T>(
  work: (session: ClientSession | undefined, undo: UndoStep[]) => Promise<T>,
): Promise<T> {
  if (await supportsTransactions()) {
    const session = await mongoose.startSession();
    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await work(session, []);
      });
      return result as T;
    } finally {
      await session.endSession();
    }
  }

  const undo: UndoStep[] = [];
  try {
    return await work(undefined, undo);
  } catch (e) {
    for (const step of undo.reverse()) {
      await step().catch((err) => console.error("rollback step failed", err));
    }
    throw e;
  }
}

function assertParty(booking: BookingDoc, actor: BookingActor) {
  const artistId = booking.artist.toString();
  const businessId = booking.bussiness ? booking.bussiness.toString() : null;
  if (actor.id !== artistId && actor.id !== businessId) {
    throw new BookingCompletionError(
      403,
      "You are not authorized to update this booking",
    );
  }
}

async function loadBooking(bookingId: string) {
  if (!isValidObjectId(bookingId)) {
    throw new BookingCompletionError(400, "Invalid booking");
  }
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new BookingCompletionError(404, "Booking not found");
  return booking;
}

const inventoryOwnerOf = (booking: BookingDoc) =>
  (booking.bussiness ?? booking.artist).toString();

async function validateMaterials(
  materials: SessionMaterialInput[],
  owner: string,
  session?: ClientSession,
) {
  if (materials.length === 0) return [];
  const found = await InventoryService.getManyForAccount(
    materials.map((m) => m.itemId),
    owner,
    session,
  );
  const byId = new Map(found.map((i) => [i._id.toString(), i]));
  return materials.map((m) => {
    const item = byId.get(m.itemId);
    if (!item) {
      throw new BookingCompletionError(
        400,
        "One of the selected materials is not in this booking's inventory",
      );
    }
    if (isWholeNumberUnit(item.type) && !Number.isInteger(m.qty)) {
      throw new BookingCompletionError(
        400,
        `${item.item} is counted in ${item.type}; enter a whole number`,
      );
    }
    if (m.qty > Number(item.stocks) + 1e-9) {
      throw new BookingCompletionError(
        409,
        `Not enough ${item.item} in stock (${item.stocks} ${item.type} left, ${m.qty} requested)`,
      );
    }
    return { item, qty: m.qty };
  });
}

async function recordUsage(
  booking: BookingDoc,
  sessionNo: number,
  materials: SessionMaterialInput[],
  actor: BookingActor,
  session: ClientSession | undefined,
  undo: UndoStep[],
) {
  const owner = inventoryOwnerOf(booking);
  const recordExpense = !booking.bussiness;
  const validated = await validateMaterials(materials, owner, session);

  const claimed = await BookingModel.findOneAndUpdate(
    {
      _id: booking._id,
      status: { $in: ACTIVE_STATUSES },
      session: sessionNo,
      "sessionUsage.session": { $ne: sessionNo },
    },
    {
      $push: {
        sessionUsage: {
          session: sessionNo,
          recordedAt: new Date(),
          recordedBy: actor.name,
          items: [],
          totalCost: 0,
          expense: null,
        },
      },
    },
    { new: true, session },
  );
  if (!claimed) {
    const latest = await BookingModel.findById(booking._id).session(
      session ?? null,
    );
    if (latest && isSessionRecorded(latest, sessionNo)) {
      return { recorded: false as const, items: [] as ConsumedItem[] };
    }
    throw new BookingCompletionError(
      409,
      "This booking changed while recording materials. Please refresh and try again.",
    );
  }
  undo.push(() =>
    BookingModel.updateOne(
      { _id: booking._id },
      { $pull: { sessionUsage: { session: sessionNo } } },
    ),
  );

  const items: ConsumedItem[] = [];
  for (const { item, qty } of validated) {
    const itemId = item._id.toString();
    const updated = await InventoryService.deductIfAvailable(
      itemId,
      owner,
      qty,
      session,
    );
    if (!updated) {
      throw new BookingCompletionError(
        409,
        `Not enough ${item.item} in stock. Please refresh and try again.`,
      );
    }
    undo.push(() => InventoryService.restoreForAccount(itemId, owner, qty));
    items.push({
      itemId,
      item: updated.item,
      unit: updated.type,
      qty,
      deducted: qty,
      unitCost: Number(updated.price),
      cost: round2(qty * Number(updated.price)),
      missing: false,
    });
  }

  const totalCost = round2(items.reduce((sum, i) => sum + i.cost, 0));

  let expenseId: mongoose.Types.ObjectId | null = null;
  if (recordExpense && totalCost > 0) {
    const client = await AccountService.get(booking.client.toString());
    const lines = items.map(
      (i) =>
        `${i.item}: ${i.qty}${i.unit ? ` ${i.unit}` : ""} × ₱${i.unitCost} = ₱${i.cost}`,
    );
    const [expense] = await ExpencesModel.create(
      [
        {
          account: owner,
          cost: totalCost,
          description: `Inventory used — session ${sessionNo}, booking with ${client?.name ?? "client"}`,
          date: todayIso(),
          recordedBy: actor.name,
          category: "Inventory Usage",
          notes: `Recorded for session ${sessionNo} of booking ${booking._id.toString()}.\n${lines.join("\n")}`,
          source: "booking_inventory",
          booking: booking._id,
          bookingSession: sessionNo,
        },
      ],
      { session },
    );
    expenseId = expense._id;
    const createdId = expense._id;
    undo.push(() => ExpencesModel.deleteOne({ _id: createdId }));
  }

  await BookingModel.updateOne(
    { _id: booking._id, "sessionUsage.session": sessionNo },
    {
      $set: {
        "sessionUsage.$.items": items,
        "sessionUsage.$.totalCost": totalCost,
        "sessionUsage.$.expense": expenseId,
      },
    },
    { session },
  );

  return { recorded: true as const, items };
}

function logUsage(
  booking: BookingDoc,
  sessionNo: number,
  items: ConsumedItem[],
  actor: BookingActor,
) {
  const owner = inventoryOwnerOf(booking);
  for (const i of items) {
    InventoryLogService.create({
      account: owner,
      date: getDate(),
      time: getTime(),
      message: `session ${sessionNo} used -${i.qty} stocks to ${i.item}`,
      type: "deduct",
      actionBy: actor.name,
    }).catch((e) => console.error("inventory log failed", e));
  }
}

export class BookingCompletionService {
  static async recordSessionMaterials(
    bookingId: string,
    actor: BookingActor,
    sessionNo: number,
    materials: SessionMaterialInput[],
  ) {
    const booking = await loadBooking(bookingId);
    assertParty(booking, actor);

    if (isSessionRecorded(booking, sessionNo)) {
      return { booking, alreadyRecorded: true as const };
    }
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      throw new BookingCompletionError(
        409,
        `Materials can't be recorded for a ${booking.status} booking`,
      );
    }
    if (sessionNo !== booking.session) {
      throw new BookingCompletionError(
        409,
        `Only the current session (session ${booking.session}) can be recorded`,
      );
    }

    const result = await runAtomically((session, undo) =>
      recordUsage(booking, sessionNo, materials, actor, session, undo),
    );
    if (result.recorded) logUsage(booking, sessionNo, result.items, actor);

    const latest = await BookingModel.findById(booking._id);
    return {
      booking: latest ?? booking,
      alreadyRecorded: !result.recorded,
    };
  }

  static async complete(
    bookingId: string,
    actor: BookingActor,
    options: {
      materials?: SessionMaterialInput[];
      closeEarly?: boolean;
      reason?: string;
    } = {},
  ) {
    const booking = await loadBooking(bookingId);
    assertParty(booking, actor);

    if (booking.status === "completed") {
      return { booking, alreadyCompleted: true as const };
    }
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      throw new BookingCompletionError(
        409,
        `A ${booking.status} booking can't be marked as completed`,
      );
    }

    const closeEarly = !!options.closeEarly;
    const sessionNo = booking.session;
    const plannedSessions = booking.sessions.length;
    const willRecord =
      options.materials !== undefined && !isSessionRecorded(booking, sessionNo);
    const performed =
      willRecord || isSessionRecorded(booking, sessionNo)
        ? sessionNo
        : Math.max(0, sessionNo - 1);

    if (closeEarly) {
      if (performed < 1) {
        throw new BookingCompletionError(
          409,
          "No session was performed yet, so this booking can't be closed early. Cancel it instead.",
        );
      }
      if (performed >= plannedSessions) {
        throw new BookingCompletionError(
          409,
          "All planned sessions were performed, so this booking can't be closed early. Collect the remaining balance and complete it normally.",
        );
      }
    } else if (!isFullyPaid(booking.balance)) {
      throw new BookingCompletionError(
        409,
        `This booking still has an unpaid balance of ₱${Number(booking.balance).toLocaleString()}`,
      );
    }

    const outcome = await runAtomically(async (session, undo) => {
      const usage = willRecord
        ? await recordUsage(
            booking,
            sessionNo,
            options.materials!,
            actor,
            session,
            undo,
          )
        : null;

      const claimed = await BookingModel.findOneAndUpdate(
        {
          _id: booking._id,
          status: { $in: ACTIVE_STATUSES },
          ...(closeEarly ? {} : { balance: { $lt: PAID_TOLERANCE } }),
        },
        {
          $set: {
            status: "completed",
            ...(closeEarly
              ? {
                  closure: {
                    type: "early",
                    sessionsPerformed: performed,
                    plannedSessions,
                    unpaidBalance: round2(Math.max(0, Number(booking.balance))),
                    reason: options.reason ?? "",
                    closedAt: new Date(),
                    closedBy: actor.name,
                  },
                }
              : {}),
          },
        },
        { new: true, session },
      );
      if (!claimed) {
        const latest = await BookingModel.findById(booking._id).session(
          session ?? null,
        );
        if (latest?.status === "completed") {
          return { booking: latest, alreadyCompleted: true as const, usage };
        }
        throw new BookingCompletionError(
          409,
          "This booking changed while completing it. Please refresh and try again.",
        );
      }
      return { booking: claimed, alreadyCompleted: false as const, usage };
    });

    if (outcome.usage?.recorded) {
      logUsage(booking, sessionNo, outcome.usage.items, actor);
    }

    return {
      booking: outcome.booking,
      alreadyCompleted: outcome.alreadyCompleted,
    };
  }
}
