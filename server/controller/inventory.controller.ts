import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { InventoryService } from "../services/inventory.service";
import { inventoryInterface, inventoryInterfaceInput } from "../types/inventory.type";
import { ExpencesService } from "../services/expences.service";
import { InventoryLogService } from "../services/inventoryLog.service";
import { getDate, getTime } from "../utils/customFunction";

export class InventoryController {
  
    static  addItem = async (request : AuthRequest , response : Response) => {
      const inventory : inventoryInterfaceInput  = request.body.inventory
      const expences : number = request.body.expences
      const recordedBy : string = request.body.recordedBy
      const account = request.account

      if(recordedBy != "none"){
        await ExpencesService.create({
            account : account?._id!,
            date : new Date().toLocaleDateString("en-US"),
            description : `${inventory.stocks}${inventory.type} ${inventory.item} to inventory`,
            cost : expences,
            recordedBy : recordedBy
        })
      } 

      await InventoryService.create(inventory)

      InventoryLogService.create({
          account : account?._id!,
          date : getDate(),
          time : getTime(),
          message : `added new item ${inventory.item} with ${inventory.stocks} ${inventory.type} stocks`,
          type : "add",
          actionBy : recordedBy != "none" ?  recordedBy :  account?.name!
      })

      const inventorys = await InventoryService.getByAccount(account!._id)
      response.send(inventorys)
    }

    static  addStocks = async (request : AuthRequest , response : Response) => {
      const account = request.account

      const {  inventoryId , stocks  ,expences , recordedBy  } = request.body
      
      const item = await InventoryService.addStocks(inventoryId, stocks)

      if(recordedBy != "none"){
        await ExpencesService.create({
            account : account?._id!,
            date : new Date().toLocaleDateString("en-US"),
            description : `Add ${stocks} ${item?.type} ${item?.item} stocks  `,
            cost : expences,
            recordedBy : recordedBy
        })
      }

      InventoryLogService.create({
          account : account?._id!,
          date : getDate(),
          time : getTime(),
          message : `+${stocks} stocks to ${item?.item}`,
          type : "add",
          actionBy : recordedBy != "none" ?  recordedBy :  account?.name!
      })

      const inventory = await InventoryService.getByAccount(account!._id)
      response.send(inventory)
    }

    static  getArtistInventory = async (request : AuthRequest , response : Response) => {
      const account = request.account
      const inventory = await InventoryService.getByAccount(account!._id)
      response.send(inventory)
    }

    static  getArtistInventoryById = async (request : AuthRequest , response : Response) => {
      const {id} = request.params
      const inventory = await InventoryService.getByAccount(id)
      response.send(inventory)
    }

    static  getInventoryLogByAccount= async (request : AuthRequest , response : Response) => {
      const {id} = request.params
      const inventoryLog = await InventoryLogService.getByAccount(id)
      console.log("get")
      response.send(inventoryLog)
    }


    static  updateItem = async (request : AuthRequest , response : Response) => {
      const  inventory : inventoryInterface = request.body.inventory
      const recordedBy = request.body.recordedBy
      const account = request.account
      const oldItem = await InventoryService.update(inventory)

      InventoryLogService.create({
          account : account?._id!,
          date : getDate(),
          time : getTime(),
          message : `update ${inventory.item} stocks from ${oldItem?.stocks} to ${inventory.stocks}`,
          type : "update",
          actionBy : recordedBy != "none" ?  recordedBy :  account?.name!
      })

      const inventorys = await InventoryService.getByAccount(account!._id)
      response.send(inventorys)
    }

    static  deleteItem = async (request : AuthRequest , response : Response) => {
      const {id} = request.params
      const account = request.account
      await InventoryService.delete(id)
      const inventory = await InventoryService.getByAccount(account!._id)
      response.send(inventory)
    }

}