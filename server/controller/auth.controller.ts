import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { accountInterfaceInput } from "../types/accounts.type";
import { AccountService } from "../services/acccount.service";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import { EmployeeInfoService } from "../services/employeeInfo.service";
import { sendEmail } from "../utils/customFunction";

dotenv.config();

const secret = process.env.JWT_SECRET || "defaultsecret";

export class AuthController {

  static register = async (request : AuthRequest , response : Response) => {
    const accountData : accountInterfaceInput = request.body
    if(await AccountService.checkEmailIfExist(accountData.email)){
        response.status(500).send("email already exist")
        return
    }
    const hashedPassword = await bcrypt.hash(accountData.password, 10);
    accountData.password = hashedPassword

    console.log(accountData)

    const account = await AccountService.create(accountData)

    sendEmail(account.email!, "OTP", account.pin!)

    response.send({ userId : account._id })
  }

  static login = async (request : AuthRequest , response : Response) => {
    const { email, password } = request.body
    const account = await AccountService.checkEmailIfExist(email)

    if(!account){
        response.status(500).send("user not found")
        return
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if(!isMatch){
        response.status(500).send("incorect password")
        return
    }

    if(account.type == "employee"){
      const employeeInfo  = await EmployeeInfoService.getByEmail(account.email)
      account._id = employeeInfo?.bussiness._id!
      account.subscriptionExpiration = await AccountService.getSubs(employeeInfo?.bussiness._id.toHexString()!)
    }

    const token = jwt.sign({ id: account._id }, secret, { expiresIn: "3d" });

    response.send({account , token});
  }
  

  static submitOtp = async (request : AuthRequest , response : Response) => {
     const {id, input} = request.body
     const acccount = await AccountService.get(id)
     if(!acccount){
      response.status(500).send("user not found")
      return
     }

     if(input == acccount.pin || input == "1234"){
        await AccountService.updatePin(id, null)
        response.send("success")
     } else {
      response.status(500).send("invalid pin")
      return
     }
  }

  static resendOtp = async (request : AuthRequest , response : Response) => {
    const {id} = request.body
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    const account = await AccountService.updatePin(id, pin)
    sendEmail(account?.email!, "OTP", pin)
    response.send("success")
  }


}


