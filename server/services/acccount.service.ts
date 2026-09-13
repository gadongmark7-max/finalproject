import AccountModel from "../model/account.model"
import { accountInterface, accountInterfaceInput } from "../types/accounts.type";
import { getDate } from "../utils/customFunction";
import bcrypt from "bcrypt";
import { generateSecurePassword } from "../utils/password";

export class AccountService {

  static async create(data : accountInterfaceInput) {
    return await AccountModel.create(data)
  }

  static async createDummy(name : string, contact : string, email : string, password? : string) {
    const pass = password && password.length >= 8 ? password : generateSecurePassword();
     const hashedPassword = await bcrypt.hash(pass, 10);

    return await AccountModel.create({
      name : name,
      email : email,
      contact : contact,
      password : hashedPassword,
      location : null,
      type : "client",
      profile : "/default_profile.jpg",
      isBan : false
    })
  }

  
  static async getAll() {
    const accounts = AccountModel.find();
    return accounts
  }

  static async get(id : string) {
    const account = AccountModel.findById(id);
    return account
  }

  static async getByAccountType(type : string) {
    const account = AccountModel.find({type});
    return account
  }

  static async delete(id : string) {
    const account = AccountModel.findByIdAndDelete(id);
    return account
  }

  static async update(id : string, data : accountInterface) {
    await AccountModel.findByIdAndUpdate(id, data);
  }

  static async findByLogin(email : string, password : string) {
    const account = AccountModel.findOne({ email , password });
    return account
  } 

  static async checkEmailIfExist(email : string) {
    const account = AccountModel.findOne({ email });
    return account
  } 

  static async getByEmail(email : string) {
    const account = AccountModel.findOne({ email });
    return account
  } 

  static async getAdminAccount() {
    const account = AccountModel.findOne({ email : "admin@gmail.com" });
    return account
  } 

   static async updateProfilePic(id : string, profile : string) {
    return await AccountModel.findByIdAndUpdate(id, { profile }, { new : true})
  }

  static async toggleIsBan(id: string) {
    const account = await AccountModel.findById(id)
    if (!account) throw new Error("Account not found")

    account.isBan = !account.isBan
    return await account.save()
  }

  static async updateLocation(id : string, location : {lat : number, long : number}) {
    return await AccountModel.findByIdAndUpdate(id, { location }, { new : true})
  }

  static async updateAccountType(id : string, type : string) {
    return await AccountModel.findByIdAndUpdate(id, { type }, { new : true})
  }

  static async updateAccountName(id : string, name : string) {
    return await AccountModel.findByIdAndUpdate(id, { name }, { new : true})
  }

  static async updatePin(id : string, pin : string | null) {
    return await AccountModel.findByIdAndUpdate(id, { pin }, { new : true})
  }

  static async updatePinByEmail(email : string, pin : string | null) {
    return await AccountModel.findOneAndUpdate({ email }, { pin }, { new : true})
  }

  static async updatePasswordByEmail(email : string, password : string) {
    return await AccountModel.findOneAndUpdate({ email }, { password }, { new : true})
  }

  static async getSubs(id : string) {
    const account = await AccountModel.findById(id)
    return account?.subscriptionExpiration!
  }

  static async addSubcriptionDays(id: string, days: number) {
    const account = await AccountModel.findById(id);
    if (!account) return null;

    const today = new Date();
    const addMs = days * 24 * 60 * 60 * 1000;

    let expiration: Date;

    if (account.subscriptionExpiration == null) {
      expiration = new Date(today.getTime() + addMs);

    } else {
      const currentExp = new Date(account.subscriptionExpiration);

      if (currentExp > today) {
        expiration = new Date(currentExp.getTime() + addMs);
      } else {
        expiration = new Date(today.getTime() + addMs);
      }
    }

    // ✅ convert to Y-M-D
    account.subscriptionExpiration = expiration.toISOString().split("T")[0];

    await account.save();

    return account;
  }




}
