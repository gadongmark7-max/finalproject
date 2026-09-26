import { ClientSession } from "mongoose";
import InventoryModel from "../model/inventory.model";
import {
  inventoryInterface,
  inventoryInterfaceInput,
} from "../types/inventory.type";

export class InventoryService {
  static async create(data: inventoryInterfaceInput) {
    return await InventoryModel.create(data);
  }

  static async getByAccount(account: string) {
    return await InventoryModel.find({ account })
      .populate("account")
      .sort({ _id: -1 });
  }

  static async getByIdForAccount(id: string, account: string) {
    return await InventoryModel.findOne({ _id: id, account });
  }

  static async updateForAccount(
    id: string,
    account: string,
    data: Partial<
      Pick<
        inventoryInterfaceInput,
        "item" | "category" | "type" | "stocks" | "safeStock" | "price"
      >
    >,
  ) {
    return await InventoryModel.findOneAndUpdate(
      { _id: id, account },
      { $set: data },
    );
  }

  static async deleteForAccount(id: string, account: string) {
    return await InventoryModel.findOneAndDelete({ _id: id, account });
  }

  static async addStocksForAccount(
    id: string,
    account: string,
    newStocks: number,
  ) {
    return await InventoryModel.findOneAndUpdate(
      { _id: id, account },
      { $inc: { stocks: newStocks } },
      { new: true },
    );
  }

  static async deductForAccount(
    id: string,
    account: string,
    qty: number,
    session?: ClientSession,
  ) {
    const before = await InventoryModel.findOneAndUpdate(
      { _id: id, account },
      [{ $set: { stocks: { $max: [0, { $subtract: ["$stocks", qty] }] } } }],
      { new: false, session },
    );
    if (!before) return null;
    return {
      item: before.item,
      unit: before.type,
      unitCost: before.price,
      stockBefore: before.stocks,
      deducted: Math.min(qty, Math.max(0, before.stocks)),
    };
  }
}
