import { isValidObjectId } from "mongoose";
import BookingModel from "../model/booking.model";
import TransactionModel from "../model/transactions.model";
import { PAYMENT_FILTER } from "./transaction.service";
import { getDate, getTime } from "../utils/customFunction";

const REFUNDABLE_STATUSES = ["active"];

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

type BookingDoc = InstanceType<typeof BookingModel>;

export class BookingRefundService {
  static async refund(bookingId: string, actor: { id: string }) {
    if (!isValidObjectId(bookingId)) {
      throw new BookingRefundError(400, "Invalid booking");
    }
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new BookingRefundError(404, "Booking not found");

    const artistId = booking.artist.toString();
    const businessId = booking.bussiness ? booking.bussiness.toString() : null;
    if (actor.id !== artistId && actor.id !== businessId) {
      throw new BookingRefundError(
        403,
        "You are not authorized to refund this booking",
      );
    }

    if (booking.status === "refund") {
      const transaction = await this.ensureRefundRecord(booking);
      return { booking, transaction, alreadyRefunded: true as const };
    }

    if (!REFUNDABLE_STATUSES.includes(booking.status)) {
      throw new BookingRefundError(
        409,
        `A ${booking.status} booking can't be refunded`,
      );
    }

    const paid = await this.sumPayments(bookingId);
    if (!(paid > 0)) {
      throw new BookingRefundError(
        409,
        "This booking has no recorded payment to refund",
      );
    }

    const claimed = await BookingModel.findOneAndUpdate(
      { _id: booking._id, status: { $in: REFUNDABLE_STATUSES } },
      { $set: { status: "refund" } },
      { new: true },
    );

    if (!claimed) {
      const latest = await BookingModel.findById(bookingId);
      if (latest?.status !== "refund") {
        throw new BookingRefundError(
          409,
          "This booking changed while processing the refund. Please refresh and try again.",
        );
      }
      const transaction = await this.ensureRefundRecord(latest);
      return { booking: latest, transaction, alreadyRefunded: true as const };
    }

    const transaction = await this.ensureRefundRecord(claimed);
    return { booking: claimed, transaction, alreadyRefunded: false as const };
  }

  private static async sumPayments(bookingId: string) {
    const payments = await TransactionModel.find({
      bookingId,
      ...PAYMENT_FILTER,
    });
    return round2(payments.reduce((sum, t) => sum + Number(t.amount || 0), 0));
  }

  private static async ensureRefundRecord(booking: BookingDoc) {
    const bookingId = booking._id.toString();
    const refId = refundRefId(bookingId);

    let refund = await TransactionModel.findOne({ refId });

    if (!refund) {
      const payments = await TransactionModel.find({
        bookingId,
        ...PAYMENT_FILTER,
      });
      const amount = round2(
        payments.reduce((sum, t) => sum + Number(t.amount || 0), 0),
      );
      if (!(amount > 0)) return null;

      const paymentMethod =
        booking.paymentMethod ??
        payments.find((t) => t.paymentMethod)?.paymentMethod ??
        "online";

      try {
        refund = await TransactionModel.create({
          sender: booking.bussiness ?? booking.artist,
          receiver: booking.client,
          amount,
          date: getDate(),
          time: getTime(),
          refId,
          bookingId,
          paymentMethod,
          type: "refund",
          refundedAt: new Date(),
        });
      } catch (e: any) {
        if (e?.code !== 11000) throw e;
        refund = await TransactionModel.findOne({ refId });
      }
    }

    if (!refund) return null;

    await TransactionModel.updateMany(
      {
        bookingId,
        ...PAYMENT_FILTER,
        refundedAt: null,
        _id: { $lt: refund._id },
      },
      { $set: { refundedAt: refund.refundedAt ?? new Date() } },
    );

    return refund;
  }
}
