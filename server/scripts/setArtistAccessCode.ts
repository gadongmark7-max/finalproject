import "dotenv/config";
import mongoose from "mongoose";
import { AccountService } from "../services/acccount.service";
import {
  ACCESS_CODE_MAX_LENGTH,
  ACCESS_CODE_MIN_LENGTH,
  hashAccessCode,
  isValidAccessCodeFormat,
  issueArtistAccessCode,
} from "../utils/accessCode";

const USAGE = [
  "usage:",
  "  node dist/scripts/setArtistAccessCode.js --email <artist email>",
  "      generates a new access code and emails it to the artist",
  "  printf '%s' \"$ACCESS_CODE\" | node dist/scripts/setArtistAccessCode.js --email <artist email>",
  "      sets the access code read from stdin (not emailed)",
  "  node dist/scripts/setArtistAccessCode.js --all-missing",
  "      generates and emails access codes for every artist that does not have one yet",
].join("\n");

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const allMissing = process.argv.includes("--all-missing");

  if (!email && !allMissing) throw new Error(USAGE);
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(process.env.MONGODB_URI);

  if (allMissing) {
    const artists = await AccountService.getArtistsWithoutAccessCode();
    let failed = 0;
    for (const artist of artists) {
      const sent = await issueArtistAccessCode(artist._id.toString());
      if (!sent) failed++;
      console.log(`${sent ? "Emailed" : "Email failed for"} ${artist.email}`);
    }
    console.log(
      `Issued access codes for ${artists.length} artist account(s), ${failed} email failure(s)`,
    );
    return;
  }

  const account = await AccountService.getByEmail(email!);
  if (!account || account.type !== "artist") {
    throw new Error(`No artist account found for ${email}`);
  }

  const provided = await readStdin();
  if (provided) {
    if (!isValidAccessCodeFormat(provided)) {
      throw new Error(
        `Access code must be ${ACCESS_CODE_MIN_LENGTH}-${ACCESS_CODE_MAX_LENGTH} characters`,
      );
    }
    await AccountService.setAccessCodeHash(
      account._id.toString(),
      await hashAccessCode(provided),
    );
    console.log(`Access code updated for ${email}`);
    return;
  }

  const sent = await issueArtistAccessCode(account._id.toString());
  console.log(
    sent
      ? `New access code emailed to ${email}`
      : `Access code was reset but the email to ${email} failed`,
  );
}

main()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
