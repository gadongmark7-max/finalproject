import mongoose, { ClientSession, isValidObjectId } from "mongoose";
import BookingModel from "../model/booking.model";
import ExpencesModel from "../model/expences.model";
import { InventoryService } from "./inventory.service";
import { InventoryLogService } from "./inventoryLog.service";
import { AccountService } from "./acccount.service";
import { getDate, getTime } from "../utils/customFunction";

const COMPLETABLE_STATUSES = ["active"];

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

const round2 = (n: number) => Math.round(n * 100) / 100;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const mergeItemsUsed = (
  itemUsed: { itemId: string; item: string; qty: number }[],
) => {
  const merged = new Map<
    string,
    { itemId: string; item: string; qty: number }
  >();
  for (const used of itemUsed) {
    const qty = Number(used.qty);
    if (!used.itemId || !Number.isFinite(qty) || qty <= 0) continue;
    const existing = merged.get(used.itemId);
    if (existing) existing.qty += qty;
    else merged.set(used.itemId, { itemId: used.itemId, item: used.item, qty });
  }
  return [...merged.values()];
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

export class BookingCompletionService {
  static async complete(
    bookingId: string,
    actor: { id: string; name: string },
  ) {
    if (!isValidObjectId(bookingId)) {
      throw new BookingCompletionError(400, "Invalid booking");
    }
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new BookingCompletionError(404, "Booking not found");

    const artistId = booking.artist.toString();
    const businessId = booking.bussiness ? booking.bussiness.toString() : null;
    if (actor.id !== artistId && actor.id !== businessId) {
      throw new BookingCompletionError(
        403,
        "You are not authorized to update this booking",
      );
    }

    if (booking.status === "completed") {
      return { booking, alreadyCompleted: true as const };
    }
    if (!COMPLETABLE_STATUSES.includes(booking.status)) {
      throw new BookingCompletionError(
        409,
        `A ${booking.status} booking can't be marked as completed`,
      );
    }

    const inventoryOwner = businessId ?? artistId;
    const recordExpense = !businessId;
    const itemsUsed = mergeItemsUsed(booking.itemUsed);
    const client = await AccountService.get(booking.client.toString());

    const run = async (session?: ClientSession) => {
      const claimed = await BookingModel.findOneAndUpdate(
        {
          _id: booking._id,
          status: { $in: COMPLETABLE_STATUSES },
          inventoryConsumption: null,
        },
        { $set: { status: "completed" } },
        { new: true, session },
      );
      if (!claimed) return null;

      const items: ConsumedItem[] = [];
      for (const used of itemsUsed) {
        const result = isValidObjectId(used.itemId)
          ? await InventoryService.deductForAccount(
              used.itemId,
              inventoryOwner,
              used.qty,
              session,
            )
          : null;
        if (!result) {
          items.push({
            itemId: used.itemId,
            item: used.item,
            qty: used.qty,
            deducted: 0,
            unitCost: 0,
            cost: 0,
            missing: true,
          });
          continue;
        }
        items.push({
          itemId: used.itemId,
          item: result.item,
          unit: result.unit,
          qty: used.qty,
          deducted: result.deducted,
          unitCost: result.unitCost,
          cost: round2(used.qty * result.unitCost),
          missing: false,
        });
      }

      const totalCost = round2(items.reduce((sum, i) => sum + i.cost, 0));

      let expenseId: mongoose.Types.ObjectId | null = null;
      if (recordExpense && totalCost > 0) {
        const lines = items
          .filter((i) => !i.missing)
          .map(
            (i) =>
              `${i.item}: ${i.qty}${i.unit ? ` ${i.unit}` : ""} × ₱${i.unitCost} = ₱${i.cost}` +
              (i.deducted < i.qty ? ` (only ${i.deducted} was in stock)` : ""),
          );
        const [expense] = await ExpencesModel.create(
          [
            {
              account: inventoryOwner,
              cost: totalCost,
              description: `Inventory used — booking with ${client?.name ?? "client"}`,
              date: todayIso(),
              recordedBy: actor.name,
              category: "Inventory Usage",
              notes: `Auto-recorded on booking completion (${bookingId}).\n${lines.join("\n")}`,
              source: "booking_inventory",
              booking: claimed._id,
            },
          ],
          { session },
        );
        expenseId = expense._id;
      }

      claimed.set("inventoryConsumption", {
        consumedAt: new Date(),
        items,
        totalCost,
        expense: expenseId,
      });
      await claimed.save({ session });
      return { booking: claimed, items };
    };

    let outcome: Awaited<ReturnType<typeof run>> = null;
    if (await supportsTransactions()) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          outcome = await run(session);
        });
      } finally {
        await session.endSession();
      }
    } else {
      outcome = await run();
    }

    if (!outcome) {
      const latest = await BookingModel.findById(bookingId);
      if (latest?.status === "completed") {
        return { booking: latest, alreadyCompleted: true as const };
      }
      throw new BookingCompletionError(
        409,
        "This booking changed while completing it. Please refresh and try again.",
      );
    }

    const { booking: completed, items } = outcome as NonNullable<
      typeof outcome
    >;
    for (const i of items) {
      InventoryLogService.create({
        account: inventoryOwner,
        date: getDate(),
        time: getTime(),
        message: i.missing
          ? `session completed — ${i.item} is no longer in inventory, nothing deducted`
          : `session completed -${i.deducted} stocks to ${i.item}` +
            (i.deducted < i.qty
              ? ` (used ${i.qty}, only ${i.deducted} in stock)`
              : ""),
        type: "deduct",
        actionBy: actor.name,
      }).catch((e) => console.error("inventory log failed", e));
    }

    return { booking: completed, alreadyCompleted: false as const };
  }
}
