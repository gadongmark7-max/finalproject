import BookingModel from "../model/booking.model";
import { bookingInterface, bookingInterfaceInput } from "../types/booking.type";
import { TattooDataInterface } from "../types/threejs.type";

export class BookingService {
  static async create(data: bookingInterfaceInput) {
    return await BookingModel.create(data);
  }

  static async getAll() {
    const bookings = await BookingModel.find()
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return bookings;
  }

  static async get(id: string) {
    const booking = await BookingModel.findById(id)
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return booking;
  }

  static async getRaw(id: string) {
    return await BookingModel.findById(id);
  }

  static async addCheckoutSession(id: string, sessionId: string) {
    await BookingModel.updateOne(
      { _id: id, "checkoutSessions.sessionId": { $ne: sessionId } },
      { $push: { checkoutSessions: { sessionId, status: "pending" } } },
    );
  }

  static async setCheckoutSessionStatus(
    id: string,
    sessionId: string,
    status: "pending" | "paid" | "expired",
  ) {
    const now = new Date();
    const updated = await BookingModel.updateOne(
      { _id: id, "checkoutSessions.sessionId": sessionId },
      {
        $set: {
          "checkoutSessions.$.status": status,
          "checkoutSessions.$.checkedAt": now,
        },
      },
    );
    if (updated.matchedCount === 0) {
      await BookingModel.updateOne(
        { _id: id, "checkoutSessions.sessionId": { $ne: sessionId } },
        {
          $push: {
            checkoutSessions: { sessionId, status, checkedAt: now },
          },
        },
      );
    }
  }

  static async getPendingCheckouts(
    filter: Record<string, unknown>,
    recheckAfterMs: number,
  ) {
    const bookings = await BookingModel.find({
      ...filter,
      "checkoutSessions.status": "pending",
    }).select("+checkoutSessions");
    const cutoff = Date.now() - recheckAfterMs;
    return bookings.flatMap((booking) =>
      (booking.checkoutSessions ?? [])
        .filter(
          (session) =>
            session.status === "pending" &&
            (!session.checkedAt || session.checkedAt.getTime() < cutoff),
        )
        .map((session) => ({
          bookingId: booking._id.toString(),
          sessionId: session.sessionId,
        })),
    );
  }

  static async getByStatusAndStatusLenght(id: string, status: string) {
    const booking = await BookingModel.find({ bussiness: id, status: status });
    return booking.length;
  }

  static async getByArtist(artist: string) {
    const booking = await BookingModel.find({ artist })
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return booking;
  }

  static async getByBussiness(bussiness: string) {
    const booking = await BookingModel.find({ bussiness })
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return booking;
  }

  static async getByBussinessCompleted(bussiness: string) {
    const booking = await BookingModel.find({ bussiness, status: "completed" })
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return booking;
  }

  static async getByClient(client: string) {
    const booking = await BookingModel.find({ client })
      .populate("artist")
      .populate("client")
      .populate("bussiness")
      .sort({ _id: -1 });
    return booking;
  }

  static async delete(id: string) {
    const booking = await BookingModel.findByIdAndDelete(id);
    return booking;
  }

  static async updateStatus(id: string, status: string) {
    const booking = await BookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    return booking;
  }

  static async transitionStatus(id: string, from: string, to: string) {
    return await BookingModel.findOneAndUpdate(
      { _id: id, status: from },
      { $set: { status: to } },
      { new: true },
    );
  }

  static async deductBalance(id: string, amount: number) {
    const booking = await BookingModel.findByIdAndUpdate(id, {
      $inc: { balance: -amount },
    });
    return booking;
  }

  static async setPaymentMethod(id: string, paymentMethod: "online" | "counter") {
    return await BookingModel.findByIdAndUpdate(id, { paymentMethod });
  }

  static async deductBalanceIfSufficient(id: string, amount: number) {
    return await BookingModel.findOneAndUpdate(
      { _id: id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true },
    );
  }

  static async bookNextSession(id: string, newTime: string[], newDate: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) return;
    await this.create({
      bussiness: booking.bussiness ? booking.bussiness._id.toString() : null,
      artist: booking.artist._id.toString(),
      client: booking.client._id.toString(),
      tattooImg: booking.tattooImg,
      sessions: booking.sessions,
      session: booking.session + 1,
      date: newDate,
      time: newTime,
      duration: newTime.length - 1,
      status: "active",
      isReviewed: false,
      balance: booking.balance,
      itemUsed: booking.itemUsed,
      originalPrice: booking.originalPrice,
      //@ts-ignore
      tattooData: booking.tattooData,
    });
  }

  static async bookNextSessionV2(
    id: string,
    newTime: string[],
    newDate: string,
  ) {
    const booking = await BookingModel.findById(id);
    if (!booking) return;

    booking.session = booking.session + 1;
    booking.date = newDate;
    booking.time = newTime;
    booking.duration = newTime.length - 1;

    await booking.save();
  }

  static async reschedBooking(id: string, newTime: string[], newDate: string) {
    await BookingModel.findByIdAndUpdate(id, { date: newDate, time: newTime });
  }

  static async markAsReviewed(id: string) {
    await BookingModel.findByIdAndUpdate(id, { isReviewed: true });
  }

  static async appointmentToSession(data: {
    id: string;
    tattooImg: string;
    sessions: number[];
    session: number;
    date: string[];
    time: string[];
    duration: number;
    status: string;
    isReviewed: boolean;
    balance: number;
    itemUsed: string[];
    tattooData: TattooDataInterface;
    originalPrice: number;
  }) {
    return await BookingModel.findByIdAndUpdate(
      data.id,
      {
        tattooImg: data.tattooImg,
        sessions: data.sessions,
        session: data.session,
        date: data.date,
        time: data.time,
        duration: data.duration,
        status: data.status,
        isReviewed: data.isReviewed,
        balance: data.balance,
        itemUsed: data.itemUsed,
        tattooData: data.tattooData,
        originalPrice: data.originalPrice,
      },
      { new: true },
    );
  }
}
