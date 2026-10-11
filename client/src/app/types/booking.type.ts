import { accountInterface } from "./accounts.type";
import { TattooDataInterface } from "./threejs.type";
import {
  BookingPaymentStatus,
  CancellationReasonCode,
  PaymentMethod,
  RefundMethod,
} from "@/lib/validation/schemas/booking";

export interface bookingInterfaceInput {
  bussiness: string | null;
  artist: string;
  client: string;
  tattooImg: string;
  sessions: number[];
  session: number;
  date: string;
  time: string[];
  duration: number;
  originalPrice: number;
  status: string;
  isReviewed: boolean;
  balance: Number;
  itemUsed: {
    item: string;
    qty: number;
  }[];
  tattooData: TattooDataInterface | null;
  paymentMethod?: PaymentMethod;
}

export interface bookingInterface {
  _id: string;
  bussiness: accountInterface | null;
  artist: accountInterface;
  client: accountInterface;
  tattooImg: string;
  sessions: number[];
  session: number;
  originalPrice: number;
  date: string;
  time: string[];
  duration: number;
  status: string;
  isReviewed: boolean;
  balance: number;
  itemUsed: {
    itemId: string;
    item: string;
    qty: number;
  }[];
  tattooData: TattooDataInterface | null;
  /** How the booking was paid, or how the client intends to pay. */
  paymentMethod?: PaymentMethod;
  paymentStatus?: BookingPaymentStatus;
  inventoryConsumption?: bookingInventoryConsumptionInterface | null;
  sessionMaterials?: plannedSessionMaterialsInterface[];
  sessionUsage?: bookingSessionUsageInterface[];
  closure?: bookingClosureInterface | null;
  cancellation?: bookingCancellationInterface | null;
}

export type bookingConsumedItemInterface =
  bookingInventoryConsumptionInterface["items"][number];

export interface bookingSessionUsageInterface {
  session: number;
  recordedAt: string;
  recordedBy: string;
  items: bookingConsumedItemInterface[];
  totalCost: number;
  expense: string | null;
}

export interface bookingClosureInterface {
  type: "early";
  sessionsPerformed: number;
  plannedSessions: number;
  unpaidBalance: number;
  reason: string;
  closedAt: string;
  closedBy: string;
}

export interface bookingCancellationInterface {
  reason: string;
  reasonCode?: CancellationReasonCode | null;
  reasonDetails?: string;
  requestedRefundMethod?: RefundMethod | null;
  cancelledByRole?: "client" | "artist" | "business" | null;
  previousStatus: string;
  paidAmount: number;
  sessionsPerformed: number;
  cancelledAt: string;
  cancelledBy: string;
}

export interface sessionMaterialInput {
  itemId: string;
  qty: number;
}

export interface bookingInventoryConsumptionInterface {
  consumedAt: string;
  items: {
    itemId: string;
    item: string;
    unit?: string;
    qty: number;
    deducted: number;
    unitCost: number;
    cost: number;
    missing: boolean;
  }[];
  totalCost: number;
  expense: string | null;
}

export interface plannedMaterialInterface {
  itemId: string;
  item: string;
  unit: string;
  qty: number;
}

export interface plannedSessionMaterialsInterface {
  session: number;
  items: plannedMaterialInterface[];
}

export type RefundRecordStatus = "pending" | "completed" | "failed";

export interface bookingRefundSummaryInterface {
  bookingId: string;
  status: string;
  canRefund: boolean;
  cancellation: bookingCancellationInterface | null;
  payments: {
    _id: string;
    amount: number;
    method: RefundMethod;
    date: string;
    time: string;
    refId: string;
    refunded: boolean;
    refund: {
      _id: string;
      status: RefundRecordStatus;
      method: RefundMethod;
      amount: number;
      date: string;
      time: string;
      providerRefundId: string | null;
      failureReason: string | null;
    } | null;
  }[];
  history: {
    _id: string;
    status: RefundRecordStatus;
    method: RefundMethod;
    amount: number;
    date: string;
    time: string;
    failureReason: string | null;
  }[];
  totals: {
    paid: number;
    refunded: number;
    pending: number;
    refundable: number;
    onlineRefundable: number;
    cashRefundable: number;
  };
}

export interface bookingRefundOutcomeInterface {
  paymentId: string;
  amount: number;
  method: RefundMethod;
  status: "completed" | "pending" | "failed" | "skipped";
  message?: string;
}
