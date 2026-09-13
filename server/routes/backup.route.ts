import { Router } from "express";
import { BackupController } from "../controller/backup.controller";
import { authenticateJWT } from "../middleware/auth";
import { restoreUpload } from "../utils/upload";

const route = Router()

route.get("/", authenticateJWT, BackupController.createBackup)
route.get("/last", authenticateJWT, BackupController.getLastBackupInfo)
route.post("/restore", authenticateJWT, restoreUpload.single("file"), BackupController.restoreBackup)

export default route
