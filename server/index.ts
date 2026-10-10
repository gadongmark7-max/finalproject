process.env.TZ = "Asia/Manila";

import express, { Request, Response } from "express";
import mongoose from "mongoose";
import routes from "./routes/route";
import cors from "cors";
import dotenv from "dotenv";

import "dotenv/config";
import { migrateExpenseIndexes } from "./model/expences.model";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongodb_uri = process.env.MONGODB_URI || "";

app.set("trust proxy", 1);
app.disable("x-powered-by");

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  express.json({
    verify: (request, _response, buffer) => {
      if (request.url?.includes("/paymongo/webhook")) {
        (request as Request & { rawBody?: Buffer }).rawBody = buffer;
      }
    },
  }),
);
app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined));

app.get("/health", (request: Request, response: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  response
    .status(dbConnected ? 200 : 503)
    .json({ status: dbConnected ? "ok" : "unavailable", db: dbConnected });
});

app.use(routes);

mongoose.connect(mongodb_uri).then(() =>
  migrateExpenseIndexes().catch((e) =>
    console.error("expense index migration failed", e),
  ),
);

app.get("/", async (request: Request, response: Response) => {
  response.send("working server...........");
});

app.listen(port, () => {
  const date = new Date();
  console.log(`Server is running on http://localhost:${port}`);
});
