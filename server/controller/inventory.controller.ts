import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { InventoryService } from "../services/inventory.service";
import { inventoryInterfaceInput } from "../types/inventory.type";
import { ExpencesService } from "../services/expences.service";
import { InventoryLogService } from "../services/inventoryLog.service";
import { getDate, getTime } from "../utils/customFunction";
import { isValidObjectId } from "mongoose";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
} from "../model/inventory.model";
import {
  addInventoryItemSchema,
  updateInventoryItemSchema,
} from "../validation/inventory.schema";

const firstIssue = (error: { issues: { message: string }[] }) =>
  error.issues[0]?.message || "Invalid request";

const formatPeso = (n: number) =>
  `₱${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export class InventoryController {
  static addItem = async (request: AuthRequest, response: Response) => {
    const expences: number = request.body.expences;
    const recordedBy: string = request.body.recordedBy;
    const account = request.account;
    if (!account) {
      response.status(401).send("unauthorized");
      return;
    }

    const parsed = addInventoryItemSchema.safeParse(
      request.body.inventory ?? {},
    );
    if (!parsed.success) {
      response.status(400).json({ error: firstIssue(parsed.error) });
      return;
    }
    const inventory: inventoryInterfaceInput = {
      ...parsed.data,
      account: account._id,
    };

    if (recordedBy != "none") {
      await ExpencesService.create({
        account: account?._id!,
        date: new Date().toLocaleDateString("en-US"),
        description: `${inventory.stocks}${inventory.type} ${inventory.item} to inventory`,
        cost: expences,
        recordedBy: recordedBy,
      });
    }

    await InventoryService.create(inventory);

    InventoryLogService.create({
      account: account?._id!,
      date: getDate(),
      time: getTime(),
      message: `added new item ${inventory.item} with ${inventory.stocks} ${inventory.type} stocks`,
      type: "add",
      actionBy: recordedBy != "none" ? recordedBy : account?.name!,
    });

    const inventorys = await InventoryService.getByAccount(account!._id);
    response.send(inventorys);
  };

  static addStocks = async (request: AuthRequest, response: Response) => {
    const account = request.account;

    const { inventoryId, stocks, expences, recordedBy } = request.body;

    const qty = Number(stocks);
    if (!Number.isInteger(qty) || qty < 1) {
      response
        .status(400)
        .json({ error: "Stock must be a whole number of at least 1" });
      return;
    }
    if (typeof inventoryId !== "string" || !isValidObjectId(inventoryId)) {
      response.status(400).json({ error: "Invalid inventory item" });
      return;
    }

    const item = await InventoryService.addStocksForAccount(
      inventoryId,
      account!._id,
      qty,
    );
    if (!item) {
      response.status(404).json({ error: "Inventory item not found" });
      return;
    }

    if (recordedBy != "none") {
      await ExpencesService.create({
        account: account?._id!,
        date: new Date().toLocaleDateString("en-US"),
        description: `Add ${stocks} ${item?.type} ${item?.item} stocks  `,
        cost: expences,
        recordedBy: recordedBy,
      });
    }

    InventoryLogService.create({
      account: account?._id!,
      date: getDate(),
      time: getTime(),
      message: `+${stocks} stocks to ${item?.item}`,
      type: "add",
      actionBy: recordedBy != "none" ? recordedBy : account?.name!,
    });

    const inventory = await InventoryService.getByAccount(account!._id);
    response.send(inventory);
  };

  static getArtistInventory = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const account = request.account;
    const inventory = await InventoryService.getByAccount(account!._id);
    response.send(inventory);
  };

  static getArtistInventoryById = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const inventory = await InventoryService.getByAccount(id);
    response.send(inventory);
  };

  static getInventoryLogByAccount = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const inventoryLog = await InventoryLogService.getByAccount(id);
    console.log("get");
    response.send(inventoryLog);
  };

  static updateItem = async (request: AuthRequest, response: Response) => {
    const recordedBy = request.body.recordedBy;
    const account = request.account;
    if (!account) {
      response.status(401).send("unauthorized");
      return;
    }

    const parsed = updateInventoryItemSchema.safeParse(
      request.body.inventory ?? {},
    );
    if (!parsed.success) {
      response.status(400).json({ error: firstIssue(parsed.error) });
      return;
    }
    const { _id, ...changes } = parsed.data;
    if (!isValidObjectId(_id)) {
      response.status(400).json({ error: "Invalid inventory item" });
      return;
    }

    const current = await InventoryService.getByIdForAccount(_id, account._id);
    if (!current) {
      response.status(404).json({ error: "Inventory item not found" });
      return;
    }

    if (
      changes.category !== undefined &&
      changes.category !== current.category &&
      !(INVENTORY_CATEGORIES as readonly string[]).includes(changes.category)
    ) {
      response.status(400).json({ error: "Please select a valid category" });
      return;
    }
    if (
      changes.type !== undefined &&
      changes.type !== current.type &&
      !(INVENTORY_UNITS as readonly string[]).includes(changes.type)
    ) {
      response.status(400).json({ error: "Please select a valid unit" });
      return;
    }

    await InventoryService.updateForAccount(_id, account._id, changes);

    const messages: string[] = [];
    if (changes.stocks !== undefined && changes.stocks !== current.stocks)
      messages.push(
        `update ${current.item} stocks from ${current.stocks} to ${changes.stocks}`,
      );
    if (changes.price !== undefined && changes.price !== current.price)
      messages.push(
        `update ${current.item} price from ${formatPeso(current.price)} to ${formatPeso(changes.price)}`,
      );
    if (messages.length === 0)
      messages.push(`update ${changes.item ?? current.item} details`);

    for (const message of messages) {
      InventoryLogService.create({
        account: account._id,
        date: getDate(),
        time: getTime(),
        message,
        type: "update",
        actionBy:
          recordedBy && recordedBy != "none" ? recordedBy : account.name,
      });
    }

    const inventorys = await InventoryService.getByAccount(account._id);
    response.send(inventorys);
  };

  static deleteItem = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const account = request.account;
    if (!isValidObjectId(id)) {
      response.status(400).json({ error: "Invalid inventory item" });
      return;
    }
    const deleted = await InventoryService.deleteForAccount(id, account!._id);
    if (!deleted) {
      response.status(404).json({ error: "Inventory item not found" });
      return;
    }
    const inventory = await InventoryService.getByAccount(account!._id);
    response.send(inventory);
  };
}
