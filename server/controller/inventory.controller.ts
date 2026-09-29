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
  isMeasuredUnit,
} from "../model/inventory.model";
import {
  addInventoryItemSchema,
  addStocksQuantityField,
  addStocksItemCountField,
  quantityPerItemUnitError,
  totalFromItems,
  updateInventoryItemSchema,
  wholeNumberUnitError,
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

    const { inventoryId, stocks, itemCount, expences, recordedBy } =
      request.body;

    if (typeof inventoryId !== "string" || !isValidObjectId(inventoryId)) {
      response.status(400).json({ error: "Invalid inventory item" });
      return;
    }

    const existing = await InventoryService.getByIdForAccount(
      inventoryId,
      account!._id,
    );
    if (!existing) {
      response.status(404).json({ error: "Inventory item not found" });
      return;
    }

    let qty: number;
    if (itemCount !== undefined && itemCount !== null && itemCount !== "") {
      if (!existing.quantityPerItem) {
        response
          .status(400)
          .json({ error: "This item has no amount per item set" });
        return;
      }
      const parsedCount = addStocksItemCountField.safeParse(itemCount);
      if (!parsedCount.success) {
        response.status(400).json({ error: firstIssue(parsedCount.error) });
        return;
      }
      qty = totalFromItems(parsedCount.data, existing.quantityPerItem);
    } else {
      const parsedQty = addStocksQuantityField.safeParse(stocks);
      if (!parsedQty.success) {
        response.status(400).json({ error: firstIssue(parsedQty.error) });
        return;
      }
      qty = parsedQty.data;
    }
    const qtyError = wholeNumberUnitError("Quantity", existing.type, qty);
    if (qtyError) {
      response.status(400).json({ error: qtyError });
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
        description: `Add ${qty} ${item?.type} ${item?.item} stocks  `,
        cost: expences,
        recordedBy: recordedBy,
      });
    }

    InventoryLogService.create({
      account: account?._id!,
      date: getDate(),
      time: getTime(),
      message: `+${qty} ${item?.type} stocks to ${item?.item}`,
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
    const { _id, itemCount, ...changes } = parsed.data;
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

    const unit = changes.type ?? current.type;
    const unitChanged = unit !== current.type;

    const requestedPerItem =
      changes.quantityPerItem !== undefined
        ? changes.quantityPerItem
        : (current.quantityPerItem ?? null);
    const perItemError = quantityPerItemUnitError(
      unit,
      changes.quantityPerItem,
    );
    if (perItemError) {
      response.status(400).json({ error: perItemError });
      return;
    }
    const quantityPerItem = isMeasuredUnit(unit) ? requestedPerItem : null;
    if (quantityPerItem !== (current.quantityPerItem ?? null)) {
      changes.quantityPerItem = quantityPerItem;
    }
    if (itemCount !== undefined) {
      if (!quantityPerItem) {
        response
          .status(400)
          .json({ error: "Set the amount per item to update by number of items" });
        return;
      }
      changes.stocks = totalFromItems(itemCount, quantityPerItem);
    }
    for (const [field, label] of [
      ["stocks", "Quantity"],
      ["safeStock", "Safe stock"],
    ] as const) {
      const value = changes[field] ?? (unitChanged ? current[field] : undefined);
      if (!unitChanged && value === current[field]) continue;
      const message = wholeNumberUnitError(label, unit, value);
      if (message) {
        response.status(400).json({ error: message });
        return;
      }
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
