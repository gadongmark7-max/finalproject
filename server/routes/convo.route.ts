import { Router } from "express";
import { ConvoController } from "../controller/convo.controller";
import { authenticateJWT } from "../middleware/auth";
import { upload } from "../utils/upload";

const route = Router()

route.get("/", authenticateJWT, ConvoController.getUserConvo)
route.get("/unread-count", authenticateJWT, ConvoController.getUnreadCount)
route.get("/artist", authenticateJWT, ConvoController.getArtistConvo)
route.post("/artist", authenticateJWT, ConvoController.openArtistConvo)
route.post("/convoId/:p2ID", authenticateJWT, ConvoController.getConvoId)
route.post("/message/file", authenticateJWT, upload.single("file")  ,ConvoController.createMessageFile)
route.post("/message", authenticateJWT, ConvoController.createMessage)
route.get("/:id", authenticateJWT, ConvoController.getConvo)


export default route