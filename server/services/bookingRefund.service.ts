import { isValidObjectId, Types } from "mongoose";
import BookingModel, { RefundMethod } from "../model/booking.model";
import TransactionModel from "../model/transactions.model";
import { PAYMENT_FILTER } from "./transaction.service";
import { NotificationService } from "./notifications.service";
import { AccountService } from "./acccount.service";
import { getDate, getTime, sendEmail } from "../utils/customFunction";
import {
  createRefund,
  getCheckoutSession,
  getRefund,
  PaymentError,
  ProviderRefund,
  ProviderRefundError,
} from "../utils/payMongo";

const REFUNDABLE_STATUSES = ["active", "cancelled"];

const REFUND_RECHECK_MS = 15 * 1000;

const STALE_CLAIM_MS = 2 * 60 * 1000;

export class BookingRefundError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const refundRefId = (bookingId: string) => `refund-${bookingId}`;

export const paymentRefundRefId = (paymentId: string) =>
  `refund-${paymentId}`;

type BookingDoc = InstanceType<typeof BookingModel>;
type TransactionDoc = InstanceType<typeof TransactionModel>;

export type RefundOutcome = {
  paymentId: string;
  amount: number;
  method: RefundMethod;
  status: "completed" | "pending" | "failed" | "skipped";
  message?: string;
};

const methodOf = (tx: { paymentMethod?: string | null }): RefundMethod =>
  tx.paymentMethod === "counter" ? "cash" : "online";

async function loadForParty(bookingId: string, actorId: string) {
  if (!isValidObjectId(bookingId)) {
    throw new BookingRefundError(400, "Invalid booking");
  }
  const booking = await BookingModel.findById(bookingId);
  if (!booking) throw new BookingRefundError(404, "Booking not found");
  const artistId = booking.artist.toString();
  const businessId = booking.bussiness ? booking.bussiness.toString() : null;
  if (actorId !== artistId && actorId !== businessId) {
    throw new BookingRefundError(
      403,
      "You are not authorized to refund this booking",
    );
  }
  return booking;
}

async function loadLedger(booking: BookingDoc) {
  const bookingId = booking._id;
  const [payments, refunds] = await Promise.all([
    TransactionModel.find({ bookingId, ...PAYMENT_FILTER }).sort({ _id: 1 }),
    TransactionModel.find({ bookingId, type: "refund" }).sort({ _id: 1 }),
  ]);
  const legacy =
    refunds.find((r) => r.refId === refundRefId(bookingId.toString())) ?? null;
  const refundFor = (payment: TransactionDoc) =>
    refunds.find((r) => r.refundOf?.equals(payment._id)) ??
    (legacy && payment.refundedAt ? legacy : null);
  return { payments, refunds, refundFor };
}

async function resolveProviderPaymentId(
  booking: BookingDoc,
  payment: TransactionDoc,
) {
  if (payment.providerPaymentId) return payment.providerPaymentId;
  const withSessions = await BookingModel.findById(booking._id).select(
    "+checkoutSessions",
  );
  const sessions = (withSessions?.checkoutSessions ?? []).filter(
    (s) => s.status === "paid",
  );
  for (const s of sessions) {
    try {
      const info = await getCheckoutSession(s.sessionId);
      if (info.paid?.refId === payment.refId && info.paid.paymentId) {
        await TransactionModel.updateOne(
          { _id: payment._id, providerPaymentId: null },
          { $set: { providerPaymentId: info.paid.paymentId } },
        );
        return info.paid.paymentId;
      }
    } catch (e) {
      console.error("checkout lookup for refund failed", s.sessionId, e);
    }
  }
  return null;
}

async function claimRefundRecord(
  booking: BookingDoc,
  payment: TransactionDoc,
  fields: {
    status: "pending" | "completed";
    method: RefundMethod;
    providerPaymentId: string | null;
  },
) {
  const refId = paymentRefundRefId(payment._id.toString());
  const now = new Date();
  const values = {
    status: fields.status,
    paymentMethod: fields.method === "cash" ? "counter" : "online",
    providerPaymentId: fields.providerPaymentId,
    providerRefundId: null,
    failureReason: null,
    refundedAt: fields.status === "completed" ? now : null,
    checkedAt: null,
    date: getDate(),
    time: getTime(),
  };
  try {
    return await TransactionModel.create({
      ...values,
      sender: booking.bussiness ?? booking.artist,
      receiver: booking.client,
      amount: round2(Number(payment.amount)),
      refId,
      bookingId: booking._id,
      type: "refund",
      refundOf: payment._id,
    });
  } catch (e: any) {
    if (e?.code !== 11000) throw e;
  }
  return await TransactionModel.findOneAndUpdate(
    { refId, status: "failed" },
    { $set: values },
    { new: true },
  );
}

async function markPaymentRefunded(paymentId: Types.ObjectId, at: Date) {
  await TransactionModel.updateOne(
    { _id: paymentId, refundedAt: null },
    { $set: { refundedAt: at } },
  );
}

async function notifyClientRefunded(booking: BookingDoc, amount: number) {
  const clientId = booking.client.toString();
  const client = await AccountService.get(clientId);
  const message = `Your booking payment of ₱${amount.toLocaleString()} has been refunded.`;
  await NotificationService.create({
    account: clientId,
    date: getDate(),
    time: getTime(),
    message,
    type: "success",
    isSeen: false,
  });
  if (client?.email) sendEmail(client.email, "Booking Refunded", message);
}

async function finalizeBooking(bookingId: Types.ObjectId | string) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking || !REFUNDABLE_STATUSES.includes(booking.status)) {
    return { booking, becameRefunded: false };
  }
  const payments = await TransactionModel.find({
    bookingId: booking._id,
    ...PAYMENT_FILTER,
  });
  if (payments.length === 0 || payments.some((p) => !p.refundedAt)) {
    return { booking, becameRefunded: false };
  }
  const claimed = await BookingModel.findOneAndUpdate(
    { _id: booking._id, status: { $in: REFUNDABLE_STATUSES } },
    { $set: { status: "refund" } },
    { new: true },
  );
  if (!claimed) return { booking, becameRefunded: false };
  const refunded = await TransactionModel.find({
    bookingId: booking._id,
    type: "refund",
    status: "completed",
  });
  await notifyClientRefunded(
    claimed,
    round2(refunded.reduce((sum, r) => sum + Number(r.amount || 0), 0)),
  ).catch((e) => console.error("refund notification failed", e));
  return { booking: claimed, becameRefunded: true };
}

async function applyProviderStatus(
  refund: TransactionDoc,
  provider: ProviderRefund,
) {
  const now = new Date();
  if (provider.status === "pending") {
    await TransactionModel.updateOne(
      { _id: refund._id, status: "pending" },
      { $set: { providerRefundId: provider.id, checkedAt: now } },
    );
    return "pending" as const;
  }
  if (provider.status === "failed") {
    await TransactionModel.updateOne(
      { _id: refund._id, status: "pending" },
      {
        $set: {
          status: "failed",
          providerRefundId: provider.id,
          failureReason: "PayMongo reported the refund as failed",
          checkedAt: now,
        },
      },
    );
    return "failed" as const;
  }
  const updated = await TransactionModel.findOneAndUpdate(
    { _id: refund._id, status: "pending" },
    {
      $set: {
        status: "completed",
        providerRefundId: provider.id,
        refundedAt: now,
        failureReason: null,
        checkedAt: now,
      },
    },
    { new: true },
  );
  const settled = updated ?? (await TransactionModel.findById(refund._id));
  if (settled?.status === "completed" && settled.refundOf) {
    await markPaymentRefunded(settled.refundOf, settled.refundedAt ?? now);
    if (settled.bookingId) await finalizeBooking(settled.bookingId);
  }
  return "completed" as const;
}

async function refundCash(
  booking: BookingDoc,
  payment: TransactionDoc,
): Promise<RefundOutcome> {
  const base = {
    paymentId: payment._id.toString(),
    amount: round2(Number(payment.amount)),
    method: "cash" as const,
  };
  const record = await claimRefundRecord(booking, payment, {
    status: "completed",
    method: "cash",
    providerPaymentId: null,
  });
  if (!record) return { ...base, status: "skipped" };
  await markPaymentRefunded(payment._id, record.refundedAt ?? new Date());
  return { ...base, status: "completed" };
}

async function refundOnline(
  booking: BookingDoc,
  payment: TransactionDoc,
): Promise<RefundOutcome> {
  const base = {
    paymentId: payment._id.toString(),
    amount: round2(Number(payment.amount)),
    method: "online" as const,
  };
  const providerPaymentId = await resolveProviderPaymentId(booking, payment);
  if (!providerPaymentId) {
    return {
      ...base,
      status: "failed",
      message:
        "The PayMongo payment for this transaction couldn't be found, so it can't be refunded online. Refund it in cash instead.",
    };
  }

  const record = await claimRefundRecord(booking, payment, {
    status: "pending",
    method: "online",
    providerPaymentId,
  });
  if (!record) return { ...base, status: "skipped" };

  try {
    const provider = await createRefund({
      paymentId: providerPaymentId,
      amount: base.amount,
      notes: `Booking ${booking._id.toString()} refund`,
      metadata: {
        bookingId: booking._id.toString(),
        transactionId: payment._id.toString(),
      },
    });
    const status = await applyProviderStatus(record, provider);
    return {
      ...base,
      status,
      message:
        status === "pending"
          ? "PayMongo accepted the refund and is still processing it."
          : status === "failed"
            ? "PayMongo reported the refund as failed."
            : undefined,
    };
  } catch (e) {
    const message =
      e instanceof ProviderRefundError
        ? e.code === "refund_amount_exceeds_payment"
          ? "PayMongo says this payment has already been refunded. Check the PayMongo dashboard before retrying."
          : e.message
        : e instanceof PaymentError
          ? e.message
          : "Could not process the PayMongo refund";
    await TransactionModel.updateOne(
      { _id: record._id, status: "pending", providerRefundId: null },
      { $set: { status: "failed", failureReason: message } },
    );
    if (!(e instanceof PaymentError)) console.error("PayMongo refund failed", e);
    return { ...base, status: "failed", message };
  }
}

export class BookingRefundService {
  static async summary(bookingId: string, actor: { id: string }) {
    const booking = await loadForParty(bookingId, actor.id);
    await this.syncPending({ bookingId: booking._id }, 0);
    return await this.buildSummary(booking._id.toString());
  }

  static async buildSummary(bookingId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new BookingRefundError(404, "Booking not found");
    const { payments, refunds, refundFor } = await loadLedger(booking);

    const rows = payments.map((p) => {
      const refund = refundFor(p);
      return {
        _id: p._id.toString(),
        amount: round2(Number(p.amount)),
        method: methodOf(p),
        date: p.date,
        time: p.time,
        refId: p.refId,
        refunded: !!p.refundedAt,
        refund: refund
          ? {
              _id: refund._id.toString(),
              status: refund.status ?? "completed",
              method: methodOf(refund),
              amount: round2(Number(refund.amount)),
              date: refund.date,
              time: refund.time,
              providerRefundId: refund.providerRefundId ?? null,
              failureReason: refund.failureReason ?? null,
            }
          : null,
      };
    });

    const sum = (items: { amount: number }[]) =>
      round2(items.reduce((s, i) => s + i.amount, 0));
    const open = rows.filter(
      (r) => !r.refunded && (!r.refund || r.refund.status === "failed"),
    );
    const pending = rows.filter((r) => r.refund?.status === "pending");

    return {
      bookingId,
      status: booking.status,
      canRefund: REFUNDABLE_STATUSES.includes(booking.status),
      cancellation: booking.cancellation ?? null,
      payments: rows,
      history: refunds.map((r) => ({
        _id: r._id.toString(),
        status: r.status ?? "completed",
        method: methodOf(r),
        amount: round2(Number(r.amount)),
        date: r.date,
        time: r.time,
        failureReason: r.failureReason ?? null,
      })),
      totals: {
        paid: sum(rows),
        refunded: sum(rows.filter((r) => r.refunded)),
        pending: sum(pending),
        refundable: sum(open),
        onlineRefundable: sum(open.filter((r) => r.method === "online")),
        cashRefundable: sum(open.filter((r) => r.method === "cash")),
      },
    };
  }

  static async refund(
    bookingId: string,
    actor: { id: string },
    method: RefundMethod,
  ) {
    const booking = await loadForParty(bookingId, actor.id);
    if (booking.status === "refund") {
      return {
        booking,
        outcomes: [] as RefundOutcome[],
        alreadyRefunded: true as const,
        summary: await this.buildSummary(bookingId),
      };
    }
    if (!REFUNDABLE_STATUSES.includes(booking.status)) {
      throw new BookingRefundError(
        409,
        `A ${booking.status} booking can't be refunded`,
      );
    }

    const { payments, refundFor } = await loadLedger(booking);
    if (payments.length === 0) {
      throw new BookingRefundError(
        409,
        "This booking has no recorded payment to refund",
      );
    }
    const open = payments.filter((p) => {
      const refund = refundFor(p);
      return !p.refundedAt && (!refund || refund.status === "failed");
    });
    const targets =
      method === "online" ? open.filter((p) => methodOf(p) === "online") : open;
    if (targets.length === 0) {
      const hasPending = payments.some((p) => refundFor(p)?.status === "pending");
      throw new BookingRefundError(
        409,
        hasPending
          ? "A PayMongo refund for this booking is still processing"
          : method === "online"
            ? "There is no online payment left to refund through PayMongo"
            : "There is nothing left to refund for this booking",
      );
    }

    const outcomes: RefundOutcome[] = [];
    for (const payment of targets) {
      outcomes.push(
        method === "cash"
          ? await refundCash(booking, payment)
          : await refundOnline(booking, payment),
      );
    }

    const { booking: latest } = await finalizeBooking(booking._id);
    return {
      booking: latest ?? booking,
      outcomes,
      alreadyRefunded: false as const,
      summary: await this.buildSummary(bookingId),
    };
  }

  static async syncPending(
    filter: Record<string, unknown>,
    recheckAfterMs = REFUND_RECHECK_MS,
  ) {
    try {
      const staleBefore = Types.ObjectId.createFromTime(
        Math.floor((Date.now() - STALE_CLAIM_MS) / 1000),
      );
      await TransactionModel.updateMany(
        {
          ...filter,
          type: "refund",
          status: "pending",
          providerRefundId: null,
          _id: { $lt: staleBefore },
        },
        {
          $set: {
            status: "failed",
            failureReason:
              "The PayMongo refund request did not finish. Check the PayMongo dashboard before retrying.",
          },
        },
      );
      const cutoff = new Date(Date.now() - recheckAfterMs);
      const pending = await TransactionModel.find({
        ...filter,
        type: "refund",
        status: "pending",
        providerRefundId: { $ne: null },
        $or: [{ checkedAt: null }, { checkedAt: { $lt: cutoff } }],
      }).limit(25);
      for (const refund of pending) {
        try {
          const provider = await getRefund(refund.providerRefundId!);
          await applyProviderStatus(refund, provider);
        } catch (e) {
          await TransactionModel.updateOne(
            { _id: refund._id },
            { $set: { checkedAt: new Date() } },
          );
          console.error("refund sync failed", refund._id.toString(), e);
        }
      }
    } catch (e) {
      console.error("refund sync failed", e);
    }
  }

  static async syncForBookings(bookingFilter: Record<string, unknown>) {
    const ids = await BookingModel.find({
      ...bookingFilter,
      status: { $in: REFUNDABLE_STATUSES },
    }).distinct("_id");
    if (ids.length === 0) return;
    await this.syncPending({ bookingId: { $in: ids } });
  }

  static async syncProviderRefund(refundId: string) {
    const provider = await getRefund(refundId);
    const refund = await TransactionModel.findOne({
      type: "refund",
      $or: [
        { providerRefundId: provider.id },
        ...(provider.paymentId
          ? [{ providerPaymentId: provider.paymentId, status: "pending" }]
          : []),
      ],
    });
    if (!refund) return "unknown" as const;
    return await applyProviderStatus(refund, provider);
  }

  static async syncByProviderPayment(paymentId: string) {
    await this.syncPending({ providerPaymentId: paymentId }, 0);
  }
}
