import crypto from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export function generateSecurePassword(length = 14) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += CHARSET[crypto.randomInt(0, CHARSET.length)];
  }
  return password;
}
