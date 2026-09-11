import { accountInterface } from "./accounts.type";
import { PaymentMethod } from "@/lib/validation/schemas/booking";

export interface transactionInterfaceInput {
  sender: string;
  receiver: string;
  date: string;
  time: string;
  refId: string;
  amount: number;
  bookingId?: string;
}

export interface transactionInterface {
  _id: string;
  sender: accountInterface;
  receiver: accountInterface;
  date: string;
  time: string;
  refId: string;
  amount: number;
  bookingId?: string;
}

export interface transactionReceiptBookingInterface {
  _id: string;
  tattooImg: string;
  originalPrice: number;
  balance: number;
  date: string;
  time: string[];
  duration: number;
  status: string;
  paymentMethod?: PaymentMethod;
}

export interface transactionReceiptInterface extends Omit<
  transactionInterface,
  "bookingId"
> {
  bookingId?: transactionReceiptBookingInterface | null;
}
