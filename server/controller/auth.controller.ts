import { getJwtSecret } from "../utils/jwtSecret";
import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { accountInterfaceInput } from "../types/accounts.type";
import { AccountService } from "../services/acccount.service";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import crypto from "crypto";
import { isValidObjectId } from "mongoose";
import { EmployeeInfoService } from "../services/employeeInfo.service";
import { sendEmail } from "../utils/customFunction";

dotenv.config();

const secret = getJwtSecret();

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

export class AuthController {

  static register = async (request : AuthRequest , response : Response) => {
    const { name, email, contact, password, location } = request.body ?? {}
    if (typeof email !== "string" || !email.trim() || typeof name !== "string" || !name.trim()) {
        response.status(400).send("name and email are required")
        return
    }
    if (typeof password !== "string" || password.length < 8) {
        response.status(400).send("password must be at least 8 characters")
        return
    }
    if(await AccountService.checkEmailIfExist(email)){
        response.status(500).send("email already exist")
        return
    }

    const pin = generateOtp()
    const accountData : accountInterfaceInput = {
        name: name.trim(),
        email: email.trim(),
        contact: typeof contact === "string" ? contact : "",
        password: await bcrypt.hash(password, 10),
        profile: "/default_profile.jpg",
        location: location && typeof location === "object" ? location : null,
        type: "client",
        subscriptionExpiration: null,
        isBan: false,
        pin,
    }

    const account = await AccountService.create(accountData)

    sendEmail(account.email!, "OTP", pin)

    response.send({ userId : account._id })
  }

  static login = async (request : AuthRequest , response : Response) => {
    const { email, password } = request.body
    if (typeof email !== "string" || typeof password !== "string") {
        response.status(400).send("email and password are required")
        return
    }
    const account = await AccountService.getByEmailWithSecrets(email)

    if(!account){
        response.status(500).send("user not found")
        return
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if(!isMatch){
        response.status(500).send("incorect password")
        return
    }

    const hasPendingOtp = !!account.pin

    if(account.type == "employee"){
      const employeeInfo  = await EmployeeInfoService.getByEmail(account.email)
      account._id = employeeInfo?.bussiness._id!
      account.subscriptionExpiration = await AccountService.getSubs(employeeInfo?.bussiness._id.toHexString()!)
    }

    const token = jwt.sign({ id: account._id }, secret, { expiresIn: "3d" });

    response.send({ account: { ...account.toJSON(), pin: hasPendingOtp ? "pending" : null }, token });
  }


  static submitOtp = async (request : AuthRequest , response : Response) => {
     const {id, input} = request.body
     if (typeof id !== "string" || !isValidObjectId(id) || typeof input !== "string") {
      response.status(400).send("invalid pin")
      return
     }
     const acccount = await AccountService.getWithSecrets(id)
     if(!acccount){
      response.status(500).send("user not found")
      return
     }

     if(acccount.pin && input === acccount.pin){
        await AccountService.updatePin(id, null)
        response.send("success")
     } else {
      response.status(500).send("invalid pin")
      return
     }
  }

  static resendOtp = async (request : AuthRequest , response : Response) => {
    const {id} = request.body
    if (typeof id !== "string" || !isValidObjectId(id)) {
      response.status(400).send("invalid request")
      return
    }
    const pin = generateOtp()
    const account = await AccountService.updatePin(id, pin)
    if (!account) {
      response.status(404).send("user not found")
      return
    }
    sendEmail(account?.email!, "OTP", pin)
    response.send("success")
  }


}


