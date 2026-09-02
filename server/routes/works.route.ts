import { Router } from "express";
import { WorksController } from "../controller/works.controller";
import { authenticateJWT } from "../middleware/auth";

const route = Router()

route.post("/", authenticateJWT, WorksController.create)
route.get("/", authenticateJWT, WorksController.getArtistWorks)
route.put("/", authenticateJWT, WorksController.updateArtistWork)
route.delete("/:id", authenticateJWT, WorksController.deleteWork)
route.get("/:id", authenticateJWT, WorksController.getWork)

export default route