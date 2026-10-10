import { isValidObjectId } from "mongoose";
import BookingModel from "../model/booking.model";
import TransactionModel from "../model/transactions.model";
import { PAYMENT_FILTER } from "./transaction.service";
import { sessionsPerformed } from "./bookingCompletion.service";

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

export class BookingCancellationService {
  static async cancel(
    bookingId: string,
    actor: { id: string; name: string },
    reason: string,
  ) {
    if (!isValidObjectId(bookingId)) {
      throw new BookingCancellationError(400, "Invalid booking");
    }
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new BookingCancellationError(404, "Booking not found");

    const artistId = booking.artist.toString();
    const businessId = booking.bussiness ? booking.bussiness.toString() : null;
    if (actor.id !== artistId && actor.id !== businessId) {
      throw new BookingCancellationError(
        403,
        "You are not authorized to cancel this booking",
      );
    }

    if (booking.status === "cancelled") {
      return { booking, alreadyCancelled: true as const };
    }
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new BookingCancellationError(
        409,
        `A ${booking.status} booking can't be cancelled`,
      );
    }

    const payments = await TransactionModel.find({
      bookingId: booking._id,
      ...PAYMENT_FILTER,
      refundedAt: null,
    });
    const paidAmount = round2(
      payments.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    );

    const claimed = await BookingModel.findOneAndUpdate(
      { _id: booking._id, status: booking.status },
      {
        $set: {
          status: "cancelled",
          cancellation: {
            reason,
            previousStatus: booking.status,
            paidAmount,
            sessionsPerformed: sessionsPerformed(booking),
            cancelledAt: new Date(),
            cancelledBy: actor.name,
          },
        },
      },
      { new: true },
    );

    if (!claimed) {
      const latest = await BookingModel.findById(bookingId);
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
}
