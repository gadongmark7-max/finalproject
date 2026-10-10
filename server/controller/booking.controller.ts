import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { BookingService } from "../services/booking.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import { TransactionService } from "../services/transaction.service";
import { getDate, getTime } from "../utils/customFunction";
import {
  getCheckoutSession,
  isCheckoutSessionId,
  PaymentError,
  verifyWebhookSignature,
} from "../utils/payMongo";
import { NotificationService } from "../services/notifications.service";
import { AccountService } from "../services/acccount.service";
import { sendEmail, sendNewClientAccountEmail } from "../utils/customFunction";
import { generateSecurePassword } from "../utils/password";
import { Console } from "console";
import { ClientDirectoryService } from "../services/clientDirectory.service";
import { PostService } from "../services/post.service";
import { isValidObjectId } from "mongoose";
import { getBookingPaymentStatus } from "../model/booking.model";
import {
  BOOKING_DURATION_ERROR_CODE,
  normalizeSessionHours,
  validateBookingDuration,
} from "../utils/bookingDuration";
import {
  BookingCompletionError,
  BookingCompletionService,
} from "../services/bookingCompletion.service";
import {
  BookingRefundError,
  BookingRefundService,
} from "../services/bookingRefund.service";
import {
  BookingCancellationError,
  BookingCancellationService,
} from "../services/bookingCancellation.service";
import {
  cancelBookingSchema,
  completeBookingSchema,
  recordSessionMaterialsSchema,
} from "../validation/booking.schema";

const CHECKOUT_RECHECK_MS = 15 * 1000;

const STATUS_UPDATES = [
  "active",
  "rejected",
  "completed",
  "refund",
  "cancelled",
] as const;

const PENDING_DECISIONS = ["active", "rejected"];

const PAYABLE_STATUSES = ["pending", "active"];

const firstIssue = (error: { issues: { message: string }[] }) =>
  error.issues[0]?.message ?? "Invalid request";

const isBookingParty = (
  booking: { artist: any; bussiness?: any },
  accountId: string,
) =>
  (booking.artist?._id ?? booking.artist)?.toString() === accountId ||
  (!!booking.bussiness &&
    (booking.bussiness._id ?? booking.bussiness).toString() === accountId);

export class BookingController {
  static createBooking = async (request: AuthRequest, response: Response) => {
    try {
      const account = request.account;
      const { booking, postId } = request.body;

      if (!booking || typeof booking !== "object") {
        response.status(400).json({ error: "Invalid booking" });
        return;
      }

      let sessions = booking.sessions;
      if (postId !== undefined) {
        const post =
          typeof postId === "string" && isValidObjectId(postId)
            ? await PostService.get(postId)
            : null;
        if (!post) {
          response.status(404).json({ error: "Tattoo post not found" });
          return;
        }
        sessions = post.sessions;
      }
      sessions = normalizeSessionHours(sessions);

      const duration = validateBookingDuration({
        sessions,
        session: 1,
        time: booking.time,
      });
      if (!duration.ok) {
        response.status(400).json({
          error: duration.message,
          code: BOOKING_DURATION_ERROR_CODE,
          requiredHours: duration.requiredHours,
          selectedHours: duration.selectedHours,
        });
        return;
      }

      const data = await BookingService.create({
        ...booking,
        sessions,
        session: 1,
        duration: duration.selectedHours,
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
      if (isValidObjectId(id)) {
        await BookingController.syncPendingCheckouts({ artist: id });
      }
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
      if (isValidObjectId(id)) {
        await BookingController.syncPendingCheckouts({ _id: id });
      }
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
      if (isValidObjectId(id)) {
        await BookingController.syncPendingCheckouts({ client: id });
      }
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
      const booking = isValidObjectId(id)
        ? await BookingService.getRaw(id)
        : null;
      if (!booking) {
        response.status(404).send("booking not found");
        return;
      }
      if (!isBookingParty(booking, request.account?._id ?? "")) {
        response.status(403).send("you are not authorized to update this booking");
        return;
      }
      if (booking.status !== "appointment") {
        response.status(409).send("only appointments can be marked as done");
        return;
      }
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
      if (isValidObjectId(id)) {
        await BookingController.syncPendingCheckouts({ bussiness: id });
      }
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

      await BookingService.setPaymentMethod(bookingId, paymentMethod);

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

  private static recordCheckout = async (
    sessionId: string,
    expectedBookingId?: string,
  ): Promise<"recorded" | "duplicate" | "pending" | "expired"> => {
    const session = await getCheckoutSession(sessionId);
    const bookingId = session.metadata.bookingId;
    if (expectedBookingId && bookingId !== expectedBookingId) {
      throw new PaymentError(409, "checkout session belongs to another booking");
    }

    if (!session.paid) {
      if (session.status === "expired" && bookingId) {
        await BookingService.setCheckoutSessionStatus(
          bookingId,
          sessionId,
          "expired",
        );
        return "expired";
      }
      if (bookingId) {
        await BookingService.setCheckoutSessionStatus(
          bookingId,
          sessionId,
          "pending",
        );
      }
      return "pending";
    }

    const { sender, receiver } = session.metadata;
    const paid = session.paid;
    if (!paid.refId || !sender || !receiver || !bookingId || !(paid.amount > 0)) {
      throw new PaymentError(422, "checkout session is missing payment details");
    }

    const result = await BookingController.recordBookingPayment(
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
    await BookingService.setCheckoutSessionStatus(bookingId, sessionId, "paid");
    return result;
  };

  private static syncPendingCheckouts = async (
    filter: Record<string, unknown>,
  ) => {
    try {
      const pending = await BookingService.getPendingCheckouts(
        filter,
        CHECKOUT_RECHECK_MS,
      );
      for (const { bookingId, sessionId } of pending) {
        try {
          await BookingController.recordCheckout(sessionId, bookingId);
        } catch (e) {
          if (e instanceof PaymentError && (e.status === 404 || e.status === 409)) {
            await BookingService.setCheckoutSessionStatus(
              bookingId,
              sessionId,
              "expired",
            );
            continue;
          }
          console.error("checkout sync failed for booking", bookingId, e);
        }
      }
    } catch (e) {
      console.error("checkout sync failed", e);
    }
  };

  static registerCheckoutSession = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const { id } = request.params;
      const { checkoutSessionId } = request.body;
      if (!isCheckoutSessionId(checkoutSessionId)) {
        response.status(400).send("invalid checkout session");
        return;
      }

      const booking = await BookingService.get(id);
      if (!booking) {
        response.status(404).send("booking not found");
        return;
      }
      if (booking.client._id.toString() !== request.account?._id) {
        response
          .status(403)
          .send("you are not authorized to pay for this booking");
        return;
      }

      const session = await getCheckoutSession(checkoutSessionId);
      if (session.metadata.bookingId !== id) {
        response
          .status(409)
          .send("checkout session belongs to another booking");
        return;
      }

      await BookingService.addCheckoutSession(id, checkoutSessionId);
      response.send({ status: "registered" });
    } catch (e) {
      if (e instanceof PaymentError) {
        response.status(e.status).send(e.message);
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static bookingPayment = async (request: AuthRequest, response: Response) => {
    try {
      const { checkoutSessionId, bookingId } = request.body;

      if (isCheckoutSessionId(checkoutSessionId)) {
        const result = await BookingController.recordCheckout(
          checkoutSessionId,
          typeof bookingId === "string" ? bookingId : undefined,
        );
        if (result === "pending" || result === "expired") {
          response.status(402).send("payment not completed");
          return;
        }
        response.send({ status: result });
        return;
      }

      if (typeof bookingId !== "string" || !isValidObjectId(bookingId)) {
        response.status(400).send("invalid checkout session");
        return;
      }

      const booking = await BookingService.get(bookingId);
      if (!booking) {
        response.status(404).send("booking not found");
        return;
      }
      const callerId = request.account?._id;
      const parties = [booking.client, booking.artist, booking.bussiness]
        .filter(Boolean)
        .map((party: any) => party._id.toString());
      if (!callerId || !parties.includes(callerId)) {
        response
          .status(403)
          .send("you are not authorized to view this booking");
        return;
      }

      const pending = await BookingService.getPendingCheckouts(
        { _id: booking._id },
        0,
      );
      let recorded = false;
      for (const { sessionId } of pending) {
        try {
          const result = await BookingController.recordCheckout(
            sessionId,
            bookingId,
          );
          if (result === "recorded" || result === "duplicate") recorded = true;
        } catch (e) {
          if (e instanceof PaymentError && (e.status === 404 || e.status === 409)) {
            await BookingService.setCheckoutSessionStatus(
              bookingId,
              sessionId,
              "expired",
            );
            continue;
          }
          throw e;
        }
      }

      const latest = await BookingService.get(bookingId);
      const paymentStatus = latest
        ? getBookingPaymentStatus(latest.originalPrice, latest.balance)
        : null;
      if (!recorded && paymentStatus === "awaiting") {
        response.status(402).send("payment not completed");
        return;
      }
      response.send({ status: "synced", paymentStatus });
    } catch (e) {
      if (e instanceof PaymentError) {
        response.status(e.status).send(e.message);
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static paymongoWebhook = async (request: AuthRequest, response: Response) => {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!secret) {
      console.error("PAYMONGO_WEBHOOK_SECRET is not set; ignoring webhook");
      response.status(503).send("webhook not configured");
      return;
    }
    if (
      !verifyWebhookSignature(
        (request as any).rawBody,
        request.headers["paymongo-signature"],
        secret,
      )
    ) {
      response.status(401).send("invalid signature");
      return;
    }

    const event = request.body?.data?.attributes;
    if (event?.type !== "checkout_session.payment.paid") {
      response.send({ received: true });
      return;
    }

    const sessionId = event?.data?.id;
    if (!isCheckoutSessionId(sessionId)) {
      response.status(400).send("invalid checkout session");
      return;
    }

    try {
      const result = await BookingController.recordCheckout(sessionId);
      response.send({ received: true, status: result });
    } catch (e) {
      if (e instanceof PaymentError && e.status < 500) {
        console.error("PayMongo webhook rejected:", e.message);
        response.send({ received: true, status: "ignored" });
        return;
      }
      console.error("PayMongo webhook failed:", e);
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
      if (!PAYABLE_STATUSES.includes(booking.status)) {
        response
          .status(409)
          .send(`a ${booking.status} booking can't receive payments`);
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
      const { id, status, reason } = request.body;

      if (!acccount) {
        response.status(401).json({ error: "unauthorized" });
        return;
      }
      if (!(STATUS_UPDATES as readonly string[]).includes(status)) {
        response.status(400).json({ error: "Invalid booking status" });
        return;
      }
      if (typeof id !== "string" || !isValidObjectId(id)) {
        response.status(400).json({ error: "Invalid booking" });
        return;
      }
      const existing = await BookingService.get(id);
      if (!existing) {
        response.status(404).json({ error: "Booking not found" });
        return;
      }
      if (!isBookingParty(existing, acccount._id)) {
        response
          .status(403)
          .json({ error: "You are not authorized to update this booking" });
        return;
      }
      const clientId = existing.client._id.toString();
      const actor = { id: acccount._id, name: acccount.name };

      if (status == "completed") {
        const parsed = completeBookingSchema.safeParse({
          materials: request.body.materials,
          closeEarly: request.body.closeEarly,
          reason: typeof reason === "string" && reason !== "none" ? reason : undefined,
        });
        if (!parsed.success) {
          response.status(400).json({ error: firstIssue(parsed.error) });
          return;
        }
        const result = await BookingCompletionService.complete(
          id,
          actor,
          parsed.data,
        );
        if (!result.alreadyCompleted) {
          const client = await AccountService.get(clientId);
          const closure = result.booking.closure;
          sendEmail(
            client?.email!,
            "Booking Completed",
            closure
              ? `Your booking was closed after ${closure.sessionsPerformed} of ${closure.plannedSessions} sessions. Thank you for trusting us!`
              : `Thankyou For Trusting us!!`,
          );
        }
        const bookings = await BookingService.getByArtist(acccount._id);
        response.send(bookings);
        return;
      }

      if (status == "cancelled") {
        const parsed = cancelBookingSchema.safeParse({ reason });
        if (!parsed.success) {
          response.status(400).json({ error: firstIssue(parsed.error) });
          return;
        }
        const result = await BookingCancellationService.cancel(
          id,
          actor,
          parsed.data.reason,
        );
        if (!result.alreadyCancelled) {
          const client = await AccountService.get(clientId);
          const message = `Your booking on ${existing.date} was cancelled. Reason: ${parsed.data.reason}`;
          await NotificationService.create({
            account: clientId,
            date: getDate(),
            time: getTime(),
            message,
            type: "error",
            isSeen: false,
          });
          sendEmail(client?.email!, "Booking Cancelled", message);
        }
        const bookings = await BookingService.getByArtist(acccount._id);
        response.send(bookings);
        return;
      }

      if (status == "refund") {
        const raw = await BookingService.getRaw(id);
        if (raw && raw.status !== "refund") {
          try {
            await BookingController.reconcileBookingPayment(raw);
          } catch (e) {
            console.error("payment reconciliation failed for booking", id, e);
          }
        }
        const result = await BookingRefundService.refund(id, {
          id: acccount._id,
        });
        if (!result.alreadyRefunded) {
          const refundClientId = result.booking.client.toString();
          const refundClient = await AccountService.get(refundClientId);
          const refundAmount = Number(result.transaction?.amount ?? 0);
          const refundMessage = `Your booking payment of ₱${refundAmount.toLocaleString()} has been refunded.`;
          await NotificationService.create({
            account: refundClientId,
            date: getDate(),
            time: getTime(),
            message: refundMessage,
            type: "success",
            isSeen: false,
          });
          sendEmail(refundClient?.email!, "Booking Refunded", refundMessage);
        }
        const bookings = await BookingService.getByArtist(acccount._id);
        response.send(bookings);
        return;
      }

      if (PENDING_DECISIONS.includes(status) && existing.status !== status) {
        const booking = await BookingService.transitionStatus(
          id,
          "pending",
          status,
        );
        if (!booking) {
          response.status(409).json({
            error: `A ${existing.status} booking can't be ${status === "active" ? "approved" : "rejected"}`,
          });
          return;
        }

        const client = await AccountService.get(clientId);

        if (status == "active") {
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
        } else {
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
        }
      }

      const bookings = await BookingService.getByArtist(acccount._id);
      response.send(bookings);
    } catch (e) {
      if (
        e instanceof BookingCompletionError ||
        e instanceof BookingRefundError ||
        e instanceof BookingCancellationError
      ) {
        response.status(e.status).json({ error: e.message });
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static recordSessionMaterials = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      const acccount = request.account;
      if (!acccount) {
        response.status(401).json({ error: "unauthorized" });
        return;
      }
      const parsed = recordSessionMaterialsSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({ error: firstIssue(parsed.error) });
        return;
      }
      const result = await BookingCompletionService.recordSessionMaterials(
        String(request.params.id),
        { id: acccount._id, name: acccount.name },
        parsed.data.session,
        parsed.data.materials,
      );
      const bookings = await BookingService.getByArtist(acccount._id);
      response.send({ alreadyRecorded: result.alreadyRecorded, bookings });
    } catch (e) {
      if (e instanceof BookingCompletionError) {
        response.status(e.status).json({ error: e.message });
        return;
      }
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static bookNextSession = async (request: AuthRequest, response: Response) => {
    try {
      const acccount = request.account;
      const { newTime, newDate, id } = request.body;
      const booking =
        typeof id === "string" && isValidObjectId(id)
          ? await BookingService.getRaw(id)
          : null;
      if (!booking) {
        response.status(404).send("booking not found");
        return;
      }
      if (!isBookingParty(booking, acccount?._id ?? "")) {
        response.status(403).send("you are not authorized to update this booking");
        return;
      }
      if (booking.status !== "active") {
        response.status(409).send(`a ${booking.status} booking can't be scheduled`);
        return;
      }
      if (booking.session >= booking.sessions.length) {
        response.status(409).send("all planned sessions are already scheduled");
        return;
      }
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
