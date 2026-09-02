import PostModel from "../model/posts.model"
import { postInterface, postInterfaceInput } from "../types/post.type"


export class PostService {

  static async create(data : postInterfaceInput) {
    return await PostModel.create(data)
  }

  static async get(id : string) {
    return await PostModel.findById(id).populate("account")
  }

  static async getAll() {
    return await PostModel.find().populate("account")
  }
  
  static async getByAccount(accountId : string) {
    return await PostModel.find({account : accountId}).populate("account")
  }

  static async delete(id : string) {
    return await PostModel.findByIdAndDelete(id)
  }

  static async update(id : string,  tags : string[],  category : string, estimatedTime : string, sessions : string, price : Number, downPercentage  : number) {
    return await PostModel.findByIdAndUpdate(id, {tags, category, estimatedTime, sessions, price, downPercentage}, { new: true })
  }

}
