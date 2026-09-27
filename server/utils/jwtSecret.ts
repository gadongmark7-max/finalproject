const MIN_JWT_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "dev-only-insecure-jwt-secret-change-me";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length >= MIN_JWT_SECRET_LENGTH) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `JWT_SECRET must be set to at least ${MIN_JWT_SECRET_LENGTH} characters in production (generate one with: openssl rand -hex 48)`,
    );
  }
  if (!secret) console.warn("JWT_SECRET is not set; using an insecure development secret");
  return secret || DEV_FALLBACK_SECRET;
}
