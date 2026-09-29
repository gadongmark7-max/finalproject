import bcrypt from "bcrypt";
import crypto from "crypto";
import { AccountService } from "../services/acccount.service";
import { sendArtistAccessCodeEmail } from "./customFunction";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ACCESS_CODE_MIN_LENGTH = 6;
export const ACCESS_CODE_MAX_LENGTH = 64;
export const ACCESS_CODE_MAX_ATTEMPTS = 5;
export const ACCESS_CODE_LOCK_MINUTES = 15;

export function normalizeAccessCode(code: string) {
  return code.trim().toUpperCase();
}

export function isValidAccessCodeFormat(code: unknown): code is string {
  if (typeof code !== "string") return false;
  const normalized = normalizeAccessCode(code);
  return (
    normalized.length >= ACCESS_CODE_MIN_LENGTH &&
    normalized.length <= ACCESS_CODE_MAX_LENGTH
  );
}

export function generateAccessCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[crypto.randomInt(0, CHARSET.length)];
  }
  return code;
}

export async function hashAccessCode(code: string) {
  return await bcrypt.hash(normalizeAccessCode(code), 10);
}

export async function verifyAccessCode(code: string, hash: string) {
  return await bcrypt.compare(normalizeAccessCode(code), hash);
}

export async function regenerateAccessCode(accountId: string) {
  const code = generateAccessCode();
  await AccountService.setAccessCodeHash(accountId, await hashAccessCode(code));
  return code;
}

export async function setCustomAccessCode(accountId: string, code: string) {
  await AccountService.setAccessCodeHash(accountId, await hashAccessCode(code));
}

export async function issueArtistAccessCode(accountId: string) {
  const account = await AccountService.get(accountId);
  if (!account || account.type !== "artist") return false;

  const code = await regenerateAccessCode(accountId);
  return await sendArtistAccessCodeEmail(account.email, account.name, code);
}
