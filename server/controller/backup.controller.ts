import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../types/request.type";
import { BackupService } from "../services/backup.service";
import { AccountService } from "../services/acccount.service";

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
      const backup = await BackupService.createBackup(request.account?._id!);
      response.status(201).send(backup);
    } catch (e) {
      console.log(e);
      response.status(500).send("failed to create backup");
    }
  };

  static listBackups = async (request: AuthRequest, response: Response) => {
    if (!isAuthorized(request)) {
      response.status(403).send("you are not authorized to access backups");
      return;
    }

    try {
      response.send(await BackupService.listBackups());
    } catch (e) {
      console.log(e);
      response.status(500).send("failed to list backups");
    }
  };

  static downloadBackup = async (request: AuthRequest, response: Response) => {
    if (!isAuthorized(request)) {
      response.status(403).send("you are not authorized to access backups");
      return;
    }

    const filename = String(request.params.filename);

    try {
      const filePath = await BackupService.getBackupFilePath(filename);
      if (!filePath) {
        response.status(404).send("backup not found");
        return;
      }
      response.download(filePath, filename);
    } catch (e: any) {
      response.status(400).send(e?.message || "invalid backup filename");
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
      // Restored data replaces every account, so tell the client whether the caller's own session still maps to one.
      const sessionValid = !!(await AccountService.get(request.account?._id!));
      response.send({ ...result, sessionValid });
    } catch (e: any) {
      console.log(e);
      response.status(400).send(e?.message || "failed to restore backup");
    } finally {
      fs.unlink(filePath, () => {});
    }
  };

}
