import AccountModel from "../model/account.model";
import BussinessInfo from "../model/bussinessInfo.model"
import { accountInterface, bussinessInfoInterface, bussinessInfoInterfaceInput, configInterface, employeeInfo } from "../types/accounts.type";
import { AccountService } from "./acccount.service";

export class BussinessInfoService {

  static async create(data : bussinessInfoInterfaceInput) {
    await BussinessInfo.create(data)
  }

  static async get(id : string) {
    return await BussinessInfo.findById(id).populate("bussiness").populate("artists.artist").populate("reviews.client").populate("employees.employee").populate("employees.employeeInfo")
  }

  static async getAll() {
    return await BussinessInfo.find().populate("bussiness").populate("artists.artist").populate("reviews.client").populate("employees.employee").populate("employees.employeeInfo")
  }

  static async getArtistBussiness(artistId : string) {
    return await BussinessInfo.find({
      "artists.artist" : artistId
    }).populate("bussiness").populate("artists.artist").populate("reviews.client").populate("employees.employee").populate("employees.employeeInfo")
  }

  
  static async getByBussiness(bussiness : string) {
    return await BussinessInfo.findOne({ bussiness }).populate("bussiness").populate("artists.artist").populate("reviews.client").populate("employees.employee").populate("employees.employeeInfo")
  }

  static async pushImg(bussiness : string, fileUrl : string, type : string, fileType : string) {
    const info = await BussinessInfo.findOne({ bussiness })
    if(!info) return
    info.profileImages.push({ fileUrl , type, fileType})
    await info.save()
  }

  static async pushReviewToBussiness(bussiness : string, img : string, comment : string, rating : number, client : string) {
      const info =  await BussinessInfo.findOne({ bussiness })
      if(!info) return
      info.reviews.push({
        client,
        comment,
        img,
        rating
      })
      await info.save()
  }

  static async pushRolesToBussiness(bussiness : string, role : string, permissions : string[]) {
      const info =  await BussinessInfo.findOne({ bussiness })
      if(!info) return
      info.roles.push({
        role,
        permissions
      })
      await info.save()
  }

  static async pushArtist(bussiness : string, artist : string ) {
      const info = await BussinessInfo.findOne({ bussiness })
      const artistData = await AccountService.get(artist)
      if (!info) return
      const exists = info.artists.some((a) => a.artist.toString() === artist.toString())
      if (exists) return 
      info.artists.push({ 
        artist, 
        commision : 0,  
        salary : 0,
        schedTime : ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"],
        schedDay : [ "Monday","Tuesday","Wednesday","Thursday","Friday"],
        salaryType : "hr",
        info : {
            fullname : artistData?.name!,
            email : artistData?.email!,
            contact : artistData?.contact!,
            dateOfBirth : "",
            Gender : "",
            civilStatus : "",
            address : "",
            TIN : "",
            SSS : "",
            PhilHealth : "",
            PagIbig : "",
        }
      })
      await info.save()
  }

   static async updateArtistSched(bussiness : string ,artist : string, schedDay : string[], schedTime : string[], salary : number, salaryType : string, commision : number) {
      const info = await BussinessInfo.findOne({ bussiness })
      if (!info) return
      info.artists.forEach((item) => {
        if(item.artist.toString() == artist){
          item.schedDay = schedDay
          item.schedTime = schedTime
          item.salary = salary
          item.salaryType = salaryType
          item.commision = commision
        }
      })
      await info.save()
    }
  

  static async pushEmployee(bussiness : string, employee : string, employeeInfo  : string, account : accountInterface) {
      const info = await BussinessInfo.findOne({ bussiness })
      if (!info) return
      info.employees.push({ 
        employee ,
        employeeInfo,
        info : {
            fullname : account.name,
            email : account.email,
            contact : account.contact,
            dateOfBirth : "",
            Gender : "",
            civilStatus : "",
            address : "",
            TIN : "",
            SSS : "",
            PhilHealth : "",
            PagIbig : "",
        }
      })
      await info.save()
  }



  static async updateConfig(id : string, config : configInterface) {
      await BussinessInfo.findByIdAndUpdate(id, { config }, { new : true })
  }

  static async updateJobPost(id : string, isLookingArtist : boolean,  jobDescription : string) {
      await BussinessInfo.findByIdAndUpdate(id, { isLookingArtist, jobDescription }, { new : true })
  }


  static async removeArtistFromBusiness(businessId : string, accountId : string) {
      return await BussinessInfo.findByIdAndUpdate(
          businessId,
          {
              $pull: {
                  artists: { artist: accountId }
              }
          },
          { new: true }
      );
  };


  static async removeEmployeeFromBusiness (businessId : string, accountId : string) {
      return await BussinessInfo.findByIdAndUpdate(
          businessId,
          {
              $pull: {
                  employees: { employee: accountId }
              }
          },
          { new: true }
      );
  };

  static async updateArtistInfo(
    businessId: string,
    accountId: string,
    info: employeeInfo
  ) {
    return await BussinessInfo.findOneAndUpdate(
      {
        _id: businessId,
        "artists.artist": accountId
      },
      {
        $set: {
          "artists.$.info": info
        }
      },
      { new: true }
    );
  }

  static async updateEmployeeInfo(
    businessId: string,
    accountId: string,
    info: employeeInfo
  ) {
    return await BussinessInfo.findOneAndUpdate(
      {
        _id: businessId,
        "employees.employee": accountId
      },
      {
        $set: {
          "employees.$.info": info
        }
      },
      { new: true }
    );
  }


} 
