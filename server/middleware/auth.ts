import { getJwtSecret } from "../utils/jwtSecret";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/request.type";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { AccountService } from "../services/acccount.service";
import { accountInterface } from "../types/accounts.type";

dotenv.config();

const secret = getJwtSecret();



export const authenticateJWT = async (request: AuthRequest, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided");
     response.status(401).json({ message: "No token provided" });
     return
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    const { id } = decoded as { id: string };
    const accountDoc = await AccountService.get(id);
    
    if (!accountDoc) {
      response.status(401).json({ message: "Invalid token" });
      return;
    }
    {
      const account: accountInterface = {
        _id: accountDoc._id.toString(),
        subscriptionExpiration : accountDoc.subscriptionExpiration!,
        profile : accountDoc.profile,
        name: accountDoc.name,
        type: accountDoc.type,
        contact: accountDoc.contact,
        email: accountDoc.email,
        password: "",
        location : accountDoc.location,
        isBan : accountDoc.isBan,
        pin : null
      };
      request.account = account;
    }
    next();
  } catch (err) {
    console.log(err)
     response.status(401).json({ message: "Invalid token" });
  }
};


export const requireAdmin = (request: AuthRequest, response: Response, next: NextFunction) => {
  if (request.account?.type !== "admin") {
    response.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
};
