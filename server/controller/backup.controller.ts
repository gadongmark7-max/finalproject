import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../types/request.type";
import { BackupService } from "../services/backup.service";

function isAuthorized(request: AuthRequest) {
  const role = request.account?.type;
  return role === "artist" || role === "admin";
}

export class BackupController {

  static createBackup = async (request: AuthRequest, response: Response) => {
    if (!isAuthorized(request)) {
      response.status(403).send("you are not authorized to access backups");
      return;
    }

    try {
      const payload = await BackupService.createBackup(request.account?._id!);
      const filename = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      response.setHeader("Content-Type", "application/json");
      response.send(payload);
    } catch (e) {
      console.log(e);
      response.status(500).send("failed to create backup");
    }
  };

  static getLastBackupInfo = async (request: AuthRequest, response: Response) => {
    if (!isAuthorized(request)) {
      response.status(403).send("you are not authorized to access backups");
      return;
    }

    try {
      const last = await BackupService.getLastBackupInfo();
      response.send(last);
    } catch (e) {
      console.log(e);
      response.status(500).send("failed to fetch backup info");
    }
  };

  static restoreBackup = async (request: AuthRequest, response: Response) => {
    if (!isAuthorized(request)) {
      response.status(403).send("you are not authorized to access backups");
      return;
    }

    if (!request.file) {
      response.status(400).send("no backup file uploaded");
      return;
    }

    const filePath = request.file.path;

    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const result = await BackupService.restoreBackup(fileContent);
      response.send(result);
    } catch (e: any) {
      console.log(e);
      response.status(400).send(e?.message || "failed to restore backup");
    } finally {
      fs.unlink(filePath, () => {});
    }
  };

}
