import InventoryLogModel from "../model/inventoryLog.model"
import { inventoryLogInterface, inventoryLogInterfaceInput } from "../types/inventory.type"


export class InventoryLogService {

  static async create(data : inventoryLogInterfaceInput) {
    return await InventoryLogModel.create(data)
  }

  static async getByAccount(account : string) {
    return await InventoryLogModel.find({ account }).sort({ _id: -1 });
  }
  


}