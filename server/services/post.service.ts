import PostModel from "../model/posts.model";
import { postInterface, postInterfaceInput } from "../types/post.type";
import { UpdatePostInput } from "../validation/post.schema";

export class PostService {
  static async create(data: postInterfaceInput) {
    return await PostModel.create(data);
  }

  static async get(id: string) {
    return await PostModel.findById(id).populate("account");
  }

  static async getAll() {
    return await PostModel.find({ deletedAt: null }).populate("account");
  }

  static async getByAccount(accountId: string) {
    return await PostModel.find({
      account: accountId,
      deletedAt: null,
    }).populate("account");
  }

  static async findActiveByImageHash(imageHash: string) {
    return await PostModel.findOne({ imageHash, deletedAt: null });
  }

  static async delete(id: string) {
    return await PostModel.findByIdAndDelete(id);
  }

  static async softDelete(id: string) {
    return await PostModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );
  }

  static async getDeletedByAccount(accountId: string) {
    return await PostModel.find({
      account: accountId,
      deletedAt: { $ne: null },
    }).populate("account");
  }

  static async restore(id: string) {
    return await PostModel.findByIdAndUpdate(
      id,
      { deletedAt: null },
      { new: true },
    );
  }

  static async update(id: string, data: UpdatePostInput) {
    return await PostModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).populate("account");
  }
}
