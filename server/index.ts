process.env.TZ = "Asia/Manila";

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import routes from "./routes/route";
import cors from "cors";
import dotenv from "dotenv";
import accountModel from "./model/account.model";
import { AccountService } from "./services/acccount.service";
import transactionsModel from "./model/transactions.model";
import bcrypt from "bcrypt";
import { ArtistInfoService } from "./services/artistInfo.service";

import "dotenv/config";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongodb_uri = process.env.MONGODB_URI || "";

app.set("trust proxy", 1);

app.use(express.json());
app.use(cors());

app.get("/health", (request: Request, response: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  response
    .status(dbConnected ? 200 : 503)
    .json({ status: dbConnected ? "ok" : "unavailable", db: dbConnected });
});

app.use(routes);

mongoose.connect(mongodb_uri);

app.get("/", async (request: Request, response: Response) => {
  response.send("working server...........");
});

app.get("/admin", async (request: Request, response: Response) => {
  const accountData = {
    name: "admin account",
    type: "admin",
    contact: "0909989875",
    email: "admin@gmail.com",
    subscriptionExpiration: null,
    password: "123",
    profile: "/default_profile.jpg",
    location: null,
    isBan: false,
  };

  if (await AccountService.checkEmailIfExist(accountData.email)) {
    response.status(500).send("admin already exist");
    return;
  }
  const hashedPassword = await bcrypt.hash(accountData.password, 10);
  accountData.password = hashedPassword;

  await AccountService.create(accountData);

  response.send("admin created");
});

app.get("/artistAccount", async (request: Request, response: Response) => {
  const accountData = {
    name: "baphomet",
    type: "artist",
    contact: "0909989875",
    email: "inkofbaphomet@gmail.com",
    subscriptionExpiration: null,
    password: "123",
    profile: "/default_profile.jpg",
    location: null,
    isBan: false,
  };

  if (await AccountService.checkEmailIfExist(accountData.email)) {
    response.status(500).send("artist already exist");
    return;
  }
  const hashedPassword = await bcrypt.hash(accountData.password, 10);
  accountData.password = hashedPassword;

  const artist = await AccountService.create(accountData);

  await ArtistInfoService.create({
    artist: artist._id.toString(),
    bio: "none",
    schedTime: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
    ],
    schedDay: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    profileImages: [],
    reviews: [],
  });

  response.send("artist created");
});

app.get("/addField", async (request: Request, response: Response) => {
  const dates = [
    "4/13/2026",
    "4/14/2026",
    "4/15/2026",
    "4/16/2026",
    "4/17/2026",
    "4/18/2026",
  ];

  const transactions = await transactionsModel.find({
    date: { $exists: true },
  });

  await Promise.all(
    transactions.map((txn) => {
      const randomIndex = Math.floor(Math.random() * dates.length);
      const randomDate = dates[randomIndex];

      return transactionsModel.updateOne(
        { _id: txn._id },
        { $set: { date: randomDate } },
      );
    }),
  );

  response.send("DB UPDATED");
});

app.listen(port, () => {
  const date = new Date();
  console.log(`Server is running on http://localhost:${port}`);
});
