import crypto from "crypto";
import { z } from "zod";
import {
  calibrationSchema,
  TATTOO_CATEGORIES,
} from "../validation/aiAnalysis.schema";

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const payloadSchema = z.object({
  style: z.enum(TATTOO_CATEGORIES),
  complexity: z.number().int().min(1).max(5),
  isColored: z.boolean(),
  calibration: calibrationSchema,
  exp: z.number(),
});

export type EstimateTokenPayload = Omit<z.infer<typeof payloadSchema>, "exp">;

const key = () =>
  crypto
    .createHash("sha256")
    .update(`${process.env.JWT_SECRET || "defaultsecret"}:client-ai-estimate`)
    .digest();

export function createEstimateToken(payload: EstimateTokenPayload): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([
    cipher.update(
      JSON.stringify({ ...payload, exp: Date.now() + TOKEN_TTL_MS }),
      "utf8",
    ),
    cipher.final(),
  ]);
  return [iv, body, cipher.getAuthTag()]
    .map((b) => b.toString("base64url"))
    .join(".");
}

export function verifyEstimateToken(
  token: string,
): EstimateTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [iv, body, tag] = parts.map((p) => Buffer.from(p, "base64url"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([
      decipher.update(body),
      decipher.final(),
    ]).toString("utf8");

    const parsed = payloadSchema.safeParse(JSON.parse(json));
    if (!parsed.success || parsed.data.exp < Date.now()) return null;
    const { exp: _exp, ...payload } = parsed.data;
    return payload;
  } catch {
    return null;
  }
}
