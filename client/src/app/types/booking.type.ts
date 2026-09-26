import { accountInterface } from "./accounts.type";
import { TattooDataInterface } from "./threejs.type";
import { PaymentMethod } from "@/lib/validation/schemas/booking";

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
  /** How the client intended to pay. Older bookings default to "online". */
  paymentMethod?: PaymentMethod;
  inventoryConsumption?: bookingInventoryConsumptionInterface | null;
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
