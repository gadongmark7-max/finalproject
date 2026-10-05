import AiEstimatorUsageModel from "../model/aiEstimatorUsage.model";

export const ESTIMATOR_ATTEMPT_LIMIT = 3;
export const ESTIMATOR_COOLDOWN_MS = 5 * 60 * 60 * 1000;

export interface EstimatorUsageStatus {
  limit: number;
  used: number;
  remaining: number;
  cooldownUntil: string | null;
  cooldownRemainingMs: number;
  serverTime: string;
}

type UsageDoc = { used?: number | null; cooldownUntil?: Date | null } | null;

const toStatus = (doc: UsageDoc, now: Date): EstimatorUsageStatus => {
  const cooldownUntil =
    doc?.cooldownUntil && doc.cooldownUntil.getTime() > now.getTime()
      ? doc.cooldownUntil
      : null;
  const used = Math.min(Number(doc?.used ?? 0), ESTIMATOR_ATTEMPT_LIMIT);
  return {
    limit: ESTIMATOR_ATTEMPT_LIMIT,
    used: cooldownUntil ? ESTIMATOR_ATTEMPT_LIMIT : used,
    remaining: cooldownUntil ? 0 : ESTIMATOR_ATTEMPT_LIMIT - used,
    cooldownUntil: cooldownUntil ? cooldownUntil.toISOString() : null,
    cooldownRemainingMs: cooldownUntil
      ? cooldownUntil.getTime() - now.getTime()
      : 0,
    serverTime: now.toISOString(),
  };
};

export const formatCooldown = (ms: number) => {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

export class AiEstimatorUsageService {
  private static async normalize(accountId: string, now: Date) {
    await AiEstimatorUsageModel.updateOne(
      { account: accountId, cooldownUntil: { $ne: null, $lte: now } },
      { $set: { used: 0, cooldownUntil: null } },
    );
    await AiEstimatorUsageModel.updateOne(
      {
        account: accountId,
        used: { $gte: ESTIMATOR_ATTEMPT_LIMIT },
        cooldownUntil: null,
      },
      {
        $set: {
          cooldownUntil: new Date(now.getTime() + ESTIMATOR_COOLDOWN_MS),
        },
      },
    );
  }

  static async getStatus(accountId: string) {
    const now = new Date();
    await this.normalize(accountId, now);
    const doc = await AiEstimatorUsageModel.findOne({ account: accountId });
    return toStatus(doc, now);
  }

  static async consume(
    accountId: string,
  ): Promise<{ allowed: boolean; status: EstimatorUsageStatus }> {
    const now = new Date();
    await this.normalize(accountId, now);

    let doc;
    try {
      doc = await AiEstimatorUsageModel.findOneAndUpdate(
        {
          account: accountId,
          used: { $lt: ESTIMATOR_ATTEMPT_LIMIT },
          cooldownUntil: null,
        },
        { $inc: { used: 1 } },
        { upsert: true, new: true },
      );
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
      doc = null;
    }

    if (!doc) {
      return { allowed: false, status: await this.getStatus(accountId) };
    }

    if (doc.used >= ESTIMATOR_ATTEMPT_LIMIT) {
      await this.normalize(accountId, now);
      doc = await AiEstimatorUsageModel.findOne({ account: accountId });
    }

    return { allowed: true, status: toStatus(doc, now) };
  }

  static async release(accountId: string) {
    await AiEstimatorUsageModel.updateOne(
      { account: accountId, used: { $gt: 0 } },
      { $inc: { used: -1 }, $set: { cooldownUntil: null } },
    );
    return await this.getStatus(accountId);
  }
}
