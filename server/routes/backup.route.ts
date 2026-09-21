import { Router } from "express";
import { BackupController } from "../controller/backup.controller";
import { authenticateJWT } from "../middleware/auth";
import { restoreUpload } from "../utils/upload";

const route = Router()

route.get("/", authenticateJWT, BackupController.listBackups)
route.post("/", authenticateJWT, BackupController.createBackup)
route.get("/download/:filename", authenticateJWT, BackupController.downloadBackup)
route.get("/last", authenticateJWT, BackupController.getLastBackupInfo)
route.post("/restore", authenticateJWT, restoreUpload.single("file"), BackupController.restoreBackup)

export default route
