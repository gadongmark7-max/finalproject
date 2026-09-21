import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import BackupLogModel from "../model/backupLog.model";

const { EJSON } = mongoose.mongo.BSON;

const BACKUP_DIR = path.join(process.cwd(), "backups");
const BACKUP_FILENAME_REGEX =
  /^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/;

export interface BackupFileInfo {
  filename: string;
  size: number;
  createdAt: string;
}

interface BackupPayload {
  meta: {
    createdAt: string;
    createdBy: string;
    version: number;
    format?: "ejson";
  };
  collections: Record<string, any[]>;
}

export class BackupService {
  static async createBackup(actorId: string): Promise<BackupFileInfo> {
    const db = mongoose.connection.db;
    if (!db) throw new Error("database not connected");

    const collectionInfos = await db.listCollections().toArray();
    const collections: Record<string, any[]> = {};

    for (const info of collectionInfos) {
      collections[info.name] = await db
        .collection(info.name)
        .find({})
        .toArray();
    }

    const createdAt = new Date();

    const payload: BackupPayload = {
      meta: {
        createdAt: createdAt.toISOString(),
        createdBy: actorId,
        version: 1,
        format: "ejson",
      },
      collections,
    };

    const filename = `backup-${createdAt.toISOString().replace(/[:.]/g, "-")}.json`;
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
    const filePath = path.join(BACKUP_DIR, filename);
    const tempPath = `${filePath}.tmp`;
    await fs.promises.writeFile(tempPath, EJSON.stringify(payload));
    await fs.promises.rename(tempPath, filePath);

    await BackupLogModel.create({
      createdBy: actorId,
      createdAt,
      collections: Object.keys(collections),
    });

    const stat = await fs.promises.stat(filePath);
    return { filename, size: stat.size, createdAt: createdAt.toISOString() };
  }

  static async listBackups(): Promise<BackupFileInfo[]> {
    let names: string[];
    try {
      names = await fs.promises.readdir(BACKUP_DIR);
    } catch (e: any) {
      if (e?.code === "ENOENT") return [];
      throw e;
    }

    const files: BackupFileInfo[] = [];
    for (const filename of names) {
      if (!BACKUP_FILENAME_REGEX.test(filename)) continue;
      const stat = await fs.promises.stat(path.join(BACKUP_DIR, filename));
      files.push({
        filename,
        size: stat.size,
        createdAt: stat.mtime.toISOString(),
      });
    }

    return files.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static async getBackupFilePath(filename: string): Promise<string | null> {
    if (!BACKUP_FILENAME_REGEX.test(filename))
      throw new Error("invalid backup filename");

    const filePath = path.join(BACKUP_DIR, filename);
    try {
      await fs.promises.access(filePath);
    } catch (e) {
      return null;
    }
    return filePath;
  }

  static async getLastBackupInfo() {
    return await BackupLogModel.findOne()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email profile");
  }

  static async restoreBackup(
    fileContent: string,
  ): Promise<{ restored: string[] }> {
    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch (e) {
      throw new Error("invalid backup file: not valid JSON");
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.meta?.version !== 1 ||
      typeof parsed.collections !== "object" ||
      parsed.collections === null
    ) {
      throw new Error("invalid backup file: unexpected format");
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("database not connected");

    const isEjson = parsed.meta?.format === "ejson";
    const collections: Record<string, any[]> = isEjson
      ? EJSON.deserialize(parsed.collections)
      : parsed.collections;
    const modelByCollection = new Map(
      mongoose.modelNames().map((modelName) => {
        const model = mongoose.model(modelName);
        return [model.collection.name, model] as const;
      }),
    );

    const existingCollections = new Set(
      (await db.listCollections().toArray()).map((c) => c.name),
    );
    const restored: string[] = [];

    for (const [name, rawDocs] of Object.entries(collections)) {
      if (!existingCollections.has(name)) continue;
      if (!Array.isArray(rawDocs)) continue;

      const model = modelByCollection.get(name);
      const docs =
        isEjson || !model
          ? rawDocs
          : rawDocs.map((doc) =>
              model.castObject(doc, { ignoreCastErrors: true }),
            );

      await db.collection(name).deleteMany({});
      if (docs.length > 0) {
        await db.collection(name).insertMany(docs);
      }
      restored.push(name);
    }

    return { restored };
  }
}
