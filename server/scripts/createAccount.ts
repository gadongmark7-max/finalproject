import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { AccountService } from "../services/acccount.service";
import { ArtistInfoService } from "../services/artistInfo.service";

const USAGE =
  "usage: printf '%s' \"$PASSWORD\" | node dist/scripts/createAccount.js --type admin|artist --email <email> --name <name> [--contact <number>]";

const MIN_PASSWORD_LENGTH = 12;
const ALLOWED_TYPES = ["admin", "artist"];

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
  const type = arg("type");
  const email = arg("email")?.trim().toLowerCase();
  const name = arg("name")?.trim();
  const contact = arg("contact")?.trim() || "N/A";
  const password = await readStdin();

  if (!type || !ALLOWED_TYPES.includes(type) || !email || !name) {
    throw new Error(USAGE);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Pipe a password of at least ${MIN_PASSWORD_LENGTH} characters on stdin.\n${USAGE}`,
    );
  }
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");

  await mongoose.connect(process.env.MONGODB_URI);

  if (await AccountService.checkEmailIfExist(email)) {
    throw new Error(`An account with email ${email} already exists`);
  }

  const account = await AccountService.create({
    name,
    type,
    contact,
    email,
    subscriptionExpiration: null,
    password: await bcrypt.hash(password, 10),
    profile: "/default_profile.jpg",
    location: null,
    isBan: false,
  });

  if (type === "artist") {
    await ArtistInfoService.create({
      artist: account._id.toString(),
      bio: "none",
      schedTime: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
      schedDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      profileImages: [],
      reviews: [],
    });
  }

  console.log(`Created ${type} account ${email} (${account._id})`);
}

main()
  .catch((error: Error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
