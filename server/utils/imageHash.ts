import crypto from "crypto";
import fs from "fs";

export function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

export async function hashRemoteImage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("failed to fetch image for hashing");
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
