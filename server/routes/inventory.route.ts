import { Router } from "express";
import { InventoryController } from "../controller/inventory.controller";
import { authenticateJWT } from "../middleware/auth";


const route = Router()

route.get("/", authenticateJWT, InventoryController.getArtistInventory)
route.get("/:id", authenticateJWT, InventoryController.getArtistInventoryById)
route.post("/", authenticateJWT, InventoryController.addItem)
route.post("/addStocks", authenticateJWT, InventoryController.addStocks)
route.put("/", authenticateJWT, InventoryController.updateItem)
route.delete("/:id", authenticateJWT, InventoryController.deleteItem)
route.get("/logs/:id", authenticateJWT, InventoryController.getInventoryLogByAccount)

export default route