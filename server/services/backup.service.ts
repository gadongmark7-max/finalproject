import mongoose from "mongoose";
import BackupLogModel from "../model/backupLog.model";

interface BackupPayload {
  meta: {
    createdAt: string;
    createdBy: string;
    version: number;
  };
  collections: Record<string, any[]>;
}

export class BackupService {

  static async createBackup(actorId: string): Promise<BackupPayload> {
    const db = mongoose.connection.db;
    if (!db) throw new Error("database not connected");

    const collectionInfos = await db.listCollections().toArray();
    const collections: Record<string, any[]> = {};

    for (const info of collectionInfos) {
      collections[info.name] = await db.collection(info.name).find({}).toArray();
    }

    const createdAt = new Date();

    await BackupLogModel.create({
      createdBy: actorId,
      createdAt,
      collections: Object.keys(collections),
    });

    return {
      meta: {
        createdAt: createdAt.toISOString(),
        createdBy: actorId,
        version: 1,
      },
      collections,
    };
  }

  static async getLastBackupInfo() {
    return await BackupLogModel.findOne().sort({ createdAt: -1 }).populate("createdBy", "name email profile");
  }

  static async restoreBackup(fileContent: string): Promise<{ restored: string[] }> {
    let parsed: any;
    try {
      parsed = JSON.parse(fileContent);
    } catch (e) {
      throw new Error("invalid backup file: not valid JSON");
    }

    if (!parsed || typeof parsed !== "object" || parsed.meta?.version !== 1 || typeof parsed.collections !== "object" || parsed.collections === null) {
      throw new Error("invalid backup file: unexpected format");
    }

    const db = mongoose.connection.db;
    if (!db) throw new Error("database not connected");

    const existingCollections = new Set((await db.listCollections().toArray()).map(c => c.name));
    const restored: string[] = [];

    for (const [name, docs] of Object.entries(parsed.collections)) {
      if (!existingCollections.has(name)) continue;
      if (!Array.isArray(docs)) continue;

      await db.collection(name).deleteMany({});
      if (docs.length > 0) {
        await db.collection(name).insertMany(docs as any[]);
      }
      restored.push(name);
    }

    return { restored };
  }

}
