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
        | "item"
        | "category"
        | "type"
        | "stocks"
        | "quantityPerItem"
        | "safeStock"
        | "price"
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
      [{ $set: { stocks: { $round: [{ $add: ["$stocks", newStocks] }, 2] } } }],
      { new: true },
    );
  }

  static async getManyForAccount(
    ids: string[],
    account: string,
    session?: ClientSession,
  ) {
    return await InventoryModel.find({ _id: { $in: ids }, account }).session(
      session ?? null,
    );
  }

  static async deductIfAvailable(
    id: string,
    account: string,
    qty: number,
    session?: ClientSession,
  ) {
    return await InventoryModel.findOneAndUpdate(
      { _id: id, account, stocks: { $gte: qty } },
      [{ $set: { stocks: { $round: [{ $subtract: ["$stocks", qty] }, 2] } } }],
      { new: true, session },
    );
  }

  static async restoreForAccount(id: string, account: string, qty: number) {
    return await InventoryModel.findOneAndUpdate(
      { _id: id, account },
      [{ $set: { stocks: { $round: [{ $add: ["$stocks", qty] }, 2] } } }],
      { new: true },
    );
  }
}
