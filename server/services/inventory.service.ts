import InventoryModel from "../model/inventory.model"
import { inventoryInterface, inventoryInterfaceInput } from "../types/inventory.type"


export class InventoryService {

  static async create(data : inventoryInterfaceInput) {
    return await InventoryModel.create(data)
  }

  static async getByAccount(account : string) {
    return await InventoryModel.find({ account }).populate('account').sort({ _id: -1 })  
  }
 
  static async update(inventory : inventoryInterface) {
    return await InventoryModel.findByIdAndUpdate(inventory._id, inventory)
  }

  static async delete(id : string) {
    return await InventoryModel.findByIdAndDelete(id)
  }

  static async addStocks(id: string, newStocks: number) {
  return await InventoryModel.findByIdAndUpdate(
    id,
    { $inc: { stocks: newStocks } },
    { new: true }
  );
}



  static async deduct(id : string, qty : number) {
    const inventory = await InventoryModel.findById(id)
    if(!inventory) return
    const newStock =  inventory.stocks - qty
    inventory.stocks = newStock < 0 ? 0 : newStock
    await inventory.save()
  }
 

}
