import AccountModel from "../model/account.model";
import ArtistInfoModel from "../model/artistInfo.model";
import {
  artistInfoInterface,
  artistInfoInterfaceInput,
} from "../types/accounts.type";

export class ArtistInfoService {
  static async create(data: artistInfoInterfaceInput) {
    await ArtistInfoModel.create(data);
  }

  static async get(id: string) {
    return await ArtistInfoModel.findById(id)
      .populate("artist")
      .populate("reviews.client");
  }

  static async getAll() {
    return await ArtistInfoModel.find()
      .populate("artist")
      .populate("reviews.client");
  }

  static async getByArtist(artist: string) {
    return await ArtistInfoModel.findOne({ artist })
      .populate("artist")
      .populate("reviews.client");
  }

  static async updateSched(
    artist: string,
    schedDay: string[],
    schedTime: string[],
  ) {
    const info = await ArtistInfoModel.findOne({ artist });
    if (!info) return;
    info.schedDay = schedDay;
    info.schedTime = schedTime;
    await info.save();
  }

  static async getHourlyRate(artist: string) {
    const info = await ArtistInfoModel.findOne({ artist })
      .select("+hourlyRate")
      .lean();
    if (!info) return undefined;
    return typeof info.hourlyRate === "number" ? info.hourlyRate : null;
  }

  static async setHourlyRate(artist: string, hourlyRate: number) {
    return await ArtistInfoModel.findOneAndUpdate(
      { artist },
      { $set: { hourlyRate } },
      { new: true, runValidators: true },
    ).select("+hourlyRate");
  }

  static async pushImg(
    artist: string,
    fileUrl: string,
    type: string,
    fileType: string,
  ) {
    const info = await ArtistInfoModel.findOne({ artist });
    if (!info) return;
    info.profileImages.push({ fileUrl, type, fileType });
    await info.save();
  }

  static async getImg(artist: string, imageId: string) {
    const info = await ArtistInfoModel.findOne({ artist });
    return info?.profileImages.id(imageId) ?? null;
  }

  static async removeImg(artist: string, imageId: string) {
    await ArtistInfoModel.updateOne(
      { artist },
      { $pull: { profileImages: { _id: imageId } } },
    );
  }

  static async pushReviewToArtist(
    artist: string,
    img: string,
    comment: string,
    rating: number,
    client: string,
  ) {
    const info = await ArtistInfoModel.findOne({ artist });
    if (!info) return;
    info.reviews.push({
      client,
      comment,
      img,
      rating,
    });
    await info.save();
  }
}
