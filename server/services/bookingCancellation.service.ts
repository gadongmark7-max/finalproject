import { isValidObjectId } from "mongoose";
import BookingModel from "../model/booking.model";
import TransactionModel from "../model/transactions.model";
import { PAYMENT_FILTER } from "./transaction.service";
import { sessionsPerformed } from "./bookingCompletion.service";
import {
  CANCELLATION_REASON_LABELS,
  ClientCancelBookingInput,
} from "../validation/booking.schema";

const CANCELLABLE_STATUSES = ["pending", "active"];

export class BookingCancellationError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type BookingDoc = InstanceType<typeof BookingModel>;

async function unrefundedPayments(booking: BookingDoc) {
  return await TransactionModel.find({
    bookingId: booking._id,
    ...PAYMENT_FILTER,
    refundedAt: null,
  });
}

async function claimCancellation(
  booking: BookingDoc,
  cancellation: Record<string, unknown>,
) {
  const claimed = await BookingModel.findOneAndUpdate(
    { _id: booking._id, status: booking.status },
    {
      $set: {
        status: "cancelled",
        cancellation: {
          ...cancellation,
          previousStatus: booking.status,
          sessionsPerformed: sessionsPerformed(booking),
          cancelledAt: new Date(),
        },
      },
    },
    { new: true },
  );

  if (!claimed) {
    const latest = await BookingModel.findById(booking._id);
    if (latest?.status === "cancelled") {
      return { booking: latest, alreadyCancelled: true as const };
    }
    throw new BookingCancellationError(
      409,
      "This booking changed while cancelling it. Please refresh and try again.",
    );
  }
  return { booking: claimed, alreadyCancelled: false as const };
}

export const formatCancellationReason = (input: ClientCancelBookingInput) =>
  input.reasonCode === "other"
    ? input.reasonDetails
    : input.reasonDetails
      ? `${CANCELLATION_REASON_LABELS[input.reasonCode]} — ${input.reasonDetails}`
      : CANCELLATION_REASON_LABELS[input.reasonCode];

export class BookingCancellationService {
  static async cancelByClient(
    bookingId: string,
    client: { id: string; name: string },
    input: ClientCancelBookingInput,
  ) {
    if (!isValidObjectId(bookingId)) {
      throw new BookingCancellationError(400, "Invalid booking");
    }
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new BookingCancellationError(404, "Booking not found");
    if (booking.client.toString() !== client.id) {
      throw new BookingCancellationError(
        403,
        "You can only cancel your own bookings",
      );
    }
    if (booking.status === "cancelled") {
      return { booking, alreadyCancelled: true as const, payments: [] };
    }
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new BookingCancellationError(
        409,
        `A ${booking.status} booking can't be cancelled`,
      );
    }

    const payments = await unrefundedPayments(booking);
    const paidAmount = round2(
      payments.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    );
    const hasOnline = payments.some((t) => t.paymentMethod !== "counter");

    let refundMethod = input.refundMethod;
    if (paidAmount > 0) {
      if (!refundMethod) {
        throw new BookingCancellationError(
          400,
          "Please select your preferred refund method",
        );
      }
      if (refundMethod === "online" && !hasOnline) {
        throw new BookingCancellationError(
          400,
          "This booking was paid at the counter, so an online refund isn't available. Please choose cash.",
        );
      }
    } else {
      refundMethod = null;
    }

    const result = await claimCancellation(booking, {
      reason: formatCancellationReason(input),
      reasonCode: input.reasonCode,
      reasonDetails: input.reasonDetails,
      requestedRefundMethod: refundMethod,
      paidAmount,
      cancelledBy: client.name,
      cancelledByRole: "client",
      cancelledById: client.id,
    });
    return { ...result, payments };
  }
}
