import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { BookingService } from "../services/booking.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import { TransactionService } from "../services/transaction.service";
import { getDate, getTime } from "../utils/customFunction";
import { getPaidCheckout, PaymentError } from "../utils/payMongo";
import { NotificationService } from "../services/notifications.service";
import { AccountService } from "../services/acccount.service";
import { InventoryService } from "../services/inventory.service";
import { InventoryLogService } from "../services/inventoryLog.service";
import { sendEmail, sendNewClientAccountEmail } from "../utils/customFunction";
import { generateSecurePassword } from "../utils/password";
import { Console } from "console";
import { ClientDirectoryService } from "../services/clientDirectory.service";

export class BookingController {
  static createBooking = async (request: AuthRequest, response: Response) => {
    try {
      const account = request.account;
      const { booking } = request.body;

      const data = await BookingService.create({
        ...booking,
        status: "pending",
      });
      sendEmail(
        account?.email!,
        "Booking pending",
        `date: ${data.date} at ${data.time[0]} to ${data.time[data.time.length - 1]}`,
      );

      const userId = data.bussiness
        ? data.bussiness.toString()
        : data.artist.toString();

      const user = await AccountService.get(userId);
      const client = await AccountService.get(data.client.toString());

      await NotificationService.create({
        account: user?._id.toString()!,
        date: getDate(),
        time: getTime(),
        message: `${client?.name} booked your service. The booking is now pending. Please approve or reject the booking.`,
        type: "success",
        isSeen: false,
      });

      response.send({ bookingId: data._id });
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getArtistBooking = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const bookings = await BookingService.getByArtist(id);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getBooking = async (request: AuthRequest, response: Response) => {
    try {
      const { id } = request.params;
      const booking = await BookingService.get(id);
      response.send(booking);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getBusinessCompletedBooking = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const bookings = await BookingService.getByBussinessCompleted(id);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getClientBooking = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const bookings = await BookingService.getByClient(id);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static completeAppointment = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      await BookingService.delete(id);
      response.send("success");
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getBussinessBooking = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const bookings = await BookingService.getByBussiness(id);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  private static recordBookingPayment = async (
    payment: {
      sender: string;
      receiver: string;
      bookingId: string;
      amount: number;
      refId: string;
      paymentMethod: "online" | "counter";
    },
    options: { requireSufficientBalance: boolean },
  ): Promise<"recorded" | "duplicate"> => {
    const { sender, receiver, bookingId, amount, refId, paymentMethod } =
      payment;

    const existing = await TransactionService.checkIfRefIdExist(refId);
    if (existing) {
      if (existing.bookingId?.toString() !== bookingId) {
        throw new PaymentError(409, "payment reference already used");
      }
      return "duplicate";
    }

    const booking = await BookingService.get(bookingId);
    if (!booking) throw new PaymentError(404, "booking not found");
    const balanceBefore = Number(booking.balance);

    let transaction;
    try {
      transaction = await TransactionService.create({
        sender,
        receiver,
        amount,
        time: getTime(),
        date: getDate(),
        refId,
        bookingId,
        paymentMethod,
      });
    } catch (e: any) {
      if (e?.code === 11000) return "duplicate";
      throw e;
    }

    try {
      if (options.requireSufficientBalance) {
        const updated = await BookingService.deductBalanceIfSufficient(
          bookingId,
          amount,
        );
        if (!updated) {
          throw new PaymentError(
            400,
            "amount is more than the remaining balance",
          );
        }
      } else {
        const deduct = Math.min(amount, balanceBefore);
        if (deduct > 0) await BookingService.deductBalance(bookingId, deduct);
      }

      if (
        booking.status === "pending" &&
        booking.originalPrice != balanceBefore
      ) {
        await BookingService.updateStatus(bookingId, "active");
      }
    } catch (e) {
      await TransactionService.deleteById(transaction._id.toString());
      throw e;
    }

    return "recorded";
  };

  static bookingPayment = async (request: AuthRequest, response: Response) => {
    try {
      const paid = await getPaidCheckout(request.body.checkoutSessionId);
      if (!paid) {
        response.status(402).send("payment not completed");
        return;
      }

      const { sender, receiver, bookingId } = paid.metadata;
      if (
        !paid.refId ||
        !sender ||
        !receiver ||
        !bookingId ||
        !(paid.amount > 0)
      ) {
        response
          .status(422)
          .send("checkout session is missing payment details");
        return;
      }

      await BookingController.recordBookingPayment(
        {
          sender,
          receiver,
          bookingId,
          amount: paid.amount,
          refId: paid.refId,
          paymentMethod: "online",
        },
        { requireSufficientBalance: false },
      );
      response.send("success");
    } catch (e) {
      if (e instanceof PaymentError) {
        response.status(e.status).send(e.message);
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static bookingCashPayment = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { bookingId } = request.body;
      const amount = Number(request.body.amount);
      const refId =
        typeof request.body.refId === "string" && request.body.refId.trim()
          ? request.body.refId.trim().slice(0, 100)
          : Date.now().toString();

      if (!Number.isFinite(amount) || amount <= 0) {
        response.status(400).send("invalid amount");
        return;
      }

      const booking = await BookingService.get(bookingId);
      if (!booking) {
        response.status(404).send("booking not found");
        return;
      }

      const callerId = request.account?._id;
      const isBookingArtist = booking.artist._id.toString() === callerId;
      const isBookingBusiness =
        !!booking.bussiness && booking.bussiness._id.toString() === callerId;
      if (!isBookingArtist && !isBookingBusiness) {
        response
          .status(403)
          .send("you are not authorized to update this booking");
        return;
      }

      await BookingController.recordBookingPayment(
        {
          sender: booking.client._id.toString(),
          receiver: (booking.bussiness ?? booking.artist)._id.toString(),
          bookingId,
          amount,
          refId,
          paymentMethod: "counter",
        },
        { requireSufficientBalance: true },
      );
      response.send("success");
    } catch (e) {
      if (e instanceof PaymentError) {
        response.status(e.status).send(e.message);
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  private static reconcileBookingPayment = async (booking: any) => {
    const bookingId = booking._id.toString();
    const paid = Number(booking.originalPrice) - Number(booking.balance);
    if (!(paid > 0)) return;

    const recorded = await TransactionService.getTotalByBooking(bookingId);
    const missing = Math.round((paid - recorded) * 100) / 100;
    if (missing <= 0) return;

    const refId = `booking-${bookingId}-paid-${paid}`;
    if (await TransactionService.checkIfRefIdExist(refId)) return;

    try {
      await TransactionService.create({
        sender: booking.client.toString(),
        receiver: (booking.bussiness ?? booking.artist).toString(),
        amount: missing,
        time: getTime(),
        date: getDate(),
        refId,
        bookingId,
        paymentMethod: booking.paymentMethod ?? "online",
      });
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
    }
  };

  static updateBookingStatus = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const acccount = request.account;
      const { id, status, reason, clientId } = request.body;
      const booking = await BookingService.updateStatus(id, status);

      const client = await AccountService.get(clientId);

      if (status == "completed" && booking) {
        const artist = await AccountService.get(booking?.artist.toString()!);
        for (let i = 0; i < booking?.itemUsed.length; i++) {
          await InventoryService.deduct(
            booking.itemUsed[i].itemId,
            booking.itemUsed[i].qty,
          );
          await InventoryLogService.create({
            account: booking.bussiness
              ? booking.bussiness.toString()
              : booking.artist.toString(),
            date: getDate(),
            time: getTime(),
            message: `session completed -${booking.itemUsed[i].qty} stocks to ${booking.itemUsed[i].item}`,
            type: "deduct",
            actionBy: artist?.name!,
          });
        }
        sendEmail(
          client?.email!,
          "Booking Completed",
          `Thankyou For Trusting us!!`,
        );
      } else if (status == "active" && booking) {
        try {
          await BookingController.reconcileBookingPayment(booking);
        } catch (e) {
          console.error("payment reconciliation failed for booking", id, e);
        }
        await NotificationService.create({
          account: clientId,
          date: getDate(),
          time: getTime(),
          message: `Artist Approve your Booking`,
          type: "success",
          isSeen: false,
        });
        sendEmail(
          client?.email!,
          "Booking Approved",
          `date: ${booking.date} at ${booking.time[0]} to ${booking.time[booking.time.length - 1]}`,
        );
      } else if (status == "rejected" && booking) {
        await NotificationService.create({
          account: clientId,
          date: getDate(),
          time: getTime(),
          message: `Artist Reject your Booking. reason : ${reason}`,
          type: "error",
          isSeen: false,
        });
        sendEmail(
          client?.email!,
          "Booking Rejected",
          `Artist Reject your Booking. reason : ${reason}`,
        );
      } else if (status == "refund" && booking) {
        await NotificationService.create({
          account: clientId,
          date: getDate(),
          time: getTime(),
          message: `Refund Sucessfully`,
          type: "success",
          isSeen: false,
        });
        sendEmail(client?.email!, "Booking Refunded", `Refund Sucessfully`);
      }

      const bookings = await BookingService.getByArtist(acccount?._id!);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static bookNextSession = async (request: AuthRequest, response: Response) => {
    try {
      const acccount = request.account;
      const { newTime, newDate, id } = request.body;
      //await BookingService.updateStatus(id, "completed")
      await BookingService.bookNextSessionV2(id, newTime, newDate);
      const bookings = await BookingService.getByArtist(acccount?._id!);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static ReschedBooking = async (request: AuthRequest, response: Response) => {
    try {
      const acccount = request.account;
      const { newTime, newDate, id, clientEmail } = request.body;
      sendEmail(
        clientEmail,
        "Booking Rescheduled",
        `new sched Date : ${newDate} at ${newTime[0]} to ${newTime[newTime.length - 1]}`,
      );
      await BookingService.reschedBooking(id, newTime, newDate);
      const bookings = await BookingService.getByArtist(acccount?._id!);
      response.send(bookings);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static createAppointment = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const account = request.account;

    const {
      clientContact,
      clientEmail,
      sessions,
      clientId,
      selectedTime,
      date,
      artistId,
      isNoAccount,
      clientName,
      bussinessId,
      clientPassword,
    } = request.body;

    if (clientPassword && clientPassword.length < 8) {
      response.status(400).send("password too short");
      return;
    }

    let client;

    if (isNoAccount == "no account") {
      const checkedAccount = await AccountService.getByEmail(clientEmail);
      if (checkedAccount) {
        client = checkedAccount;
      } else {
        const plainPassword =
          clientPassword && clientPassword.length >= 8
            ? clientPassword
            : generateSecurePassword();
        const dummyAccount = await AccountService.createDummy(
          clientName,
          clientContact,
          clientEmail,
          plainPassword,
        );
        client = dummyAccount;
        sendNewClientAccountEmail(clientEmail, clientName, plainPassword);
      }
    } else {
      client = await AccountService.get(clientId);
    }

    const booking = await BookingService.create({
      bussiness: bussinessId != "none" ? bussinessId : null,
      artist: artistId,
      client: client?._id.toString()!,
      tattooImg: "none",
      sessions: sessions,
      session: 1,
      date: date,
      time: selectedTime,
      duration: selectedTime.length - 1,
      status: "appointment",
      isReviewed: false,
      balance: 0,
      itemUsed: [],
      tattooData: null,
      originalPrice: 0,
    });

    sendEmail(
      client?.email!,
      "Appointment Created",
      `date: ${booking.date} at ${booking.time[0]} to ${booking.time[booking.time.length - 1]}`,
    );

    response.send("book created");
  };

  static customBooking = async (request: AuthRequest, response: Response) => {
    try {
      const {
        clientContact,
        clientEmail,
        sessions,
        type,
        link,
        price,
        clientId,
        selectedTime,
        date,
        itemUsed,
        artistId,
        isNoAccount,
        clientName,
        bussinessId,
        tattooData,
        appointmentId,
      } = request.body;

      const clientPassword =
        request.body.clientPassword && request.body.clientPassword !== "none"
          ? request.body.clientPassword
          : undefined;

      if (clientPassword && clientPassword.length < 8) {
        response.status(400).json({ error: "password too short" });
        return;
      }

      let url;

      if (type == "newPost") {
        if (!request.file) {
          response.status(400).json({ error: "No file uploaded" });
          return;
        }

        const uploadResult = await cloudinary.uploader.upload(
          request.file.path,
          {
            folder: "nextjs_uploads",
          },
        );

        fs.unlinkSync(request.file.path);

        url = uploadResult.secure_url;
      } else {
        url = link;
      }

      const parsedSesion: number[] = JSON.parse(sessions);
      const parsedSelectedTime: string[] = JSON.parse(selectedTime);
      const parsedItemUsed: any[] = JSON.parse(itemUsed);
      const tattooDataProcessed =
        tattooData != "none" ? JSON.parse(tattooData) : null;

      let client;

      if (isNoAccount == "no account") {
        const checkedAccount = await AccountService.getByEmail(clientEmail);
        if (checkedAccount) {
          client = checkedAccount;
        } else {
          const plainPassword =
            clientPassword && clientPassword.length >= 8
              ? clientPassword
              : generateSecurePassword();
          const dummyAccount = await AccountService.createDummy(
            clientName,
            clientContact,
            clientEmail,
            plainPassword,
          );
          client = dummyAccount;
          sendNewClientAccountEmail(clientEmail, clientName, plainPassword);
        }
      } else {
        client = await AccountService.get(clientId);
      }

      let booking;

      if (appointmentId == "none") {
        booking = await BookingService.create({
          bussiness: bussinessId != "none" ? bussinessId : null,
          artist: artistId,
          client: client?._id.toString()!,
          tattooImg: url,
          sessions: parsedSesion,
          session: 1,
          date: date,
          time: parsedSelectedTime,
          duration: parsedSelectedTime.length - 1,
          status: "active",
          isReviewed: false,
          balance: price,
          itemUsed: parsedItemUsed,
          tattooData: tattooDataProcessed,
          originalPrice: price,
        });
      } else {
        booking = await BookingService.appointmentToSession({
          id: appointmentId,
          tattooImg: url,
          sessions: parsedSesion,
          session: 1,
          date: date,
          time: parsedSelectedTime,
          duration: parsedSelectedTime.length - 1,
          status: "active",
          isReviewed: false,
          balance: price,
          itemUsed: parsedItemUsed,
          tattooData: tattooDataProcessed,
          originalPrice: price,
        });
        console.log(booking);
      }

      sendEmail(
        client?.email!,
        "Booking Created",
        `date: ${booking!.date} at ${booking!.time[0]} to ${booking!.time[booking!.time.length - 1]}`,
      );

      response.send("book created");
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };

  /**
   * Search + paginate the clients available to the artist appointment page.
   * Dedicated endpoint — does not touch the existing /convo or /account APIs.
   * Query: ?page=1&limit=10&search=John
   */
  static getAppointmentClients = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const artistId = request.account?._id;
      if (!artistId) {
        response.status(401).send("unauthorized");
        return;
      }

      const result = await ClientDirectoryService.getArtistClients(artistId, {
        page: Number(request.query.page),
        limit: Number(request.query.limit),
        search: (request.query.search as string) || "",
      });

      response.send(result);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  /**
   * Search + paginate the clients available to the artist add-booking page.
   * Separate dedicated endpoint to keep the two flows isolated.
   * Query: ?page=1&limit=10&search=John
   */
  static getAddBookingClients = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const artistId = request.account?._id;
      if (!artistId) {
        response.status(401).send("unauthorized");
        return;
      }

      const result = await ClientDirectoryService.getArtistClients(artistId, {
        page: Number(request.query.page),
        limit: Number(request.query.limit),
        search: (request.query.search as string) || "",
      });

      response.send(result);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };
}
