import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { postInterface, postInterfaceInput } from "../types/post.type";
import { PostService } from "../services/post.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import { NotificationService } from "../services/notifications.service";
import { hashFile, hashRemoteImage } from "../utils/imageHash";

const DUPLICATE_IMAGE_RESPONSE = {
  error: "This tattoo image already exists.",
  code: "DUPLICATE_IMAGE",
};

export class PostController {
  static addPost = async (request: AuthRequest, response: Response) => {
    try {
      const {
        tags,
        category,
        sessions,
        type,
        link,
        price,
        itemUsed,
        downPercentage,
        size,
      } = request.body;

      let url: string;
      let imageHash: string;

      if (type == "newPost") {
        if (!request.file) {
          response.status(400).json({ error: "No file uploaded" });
          return;
        }

        imageHash = await hashFile(request.file.path);

        const existingPost = await PostService.findActiveByImageHash(imageHash);
        if (existingPost) {
          fs.unlinkSync(request.file.path);
          response.status(409).json(DUPLICATE_IMAGE_RESPONSE);
          return;
        }

        const uploadResult = await cloudinary.uploader.upload(
          request.file.path,
          {
            folder: "nextjs_uploads",
          },
        );

        fs.unlinkSync(request.file.path);

        url = uploadResult.secure_url;
      } else {
        url = link;

        imageHash = await hashRemoteImage(url);

        const existingPost = await PostService.findActiveByImageHash(imageHash);
        if (existingPost) {
          response.status(409).json(DUPLICATE_IMAGE_RESPONSE);
          return;
        }
      }

      const account = request.account;

      const parsedTags = JSON.parse(tags);
      const parsedSesion = JSON.parse(sessions);
      const parsedItemUsed = JSON.parse(itemUsed);

      await PostService.create({
        account: account?._id!,
        postImg: url,
        tags: parsedTags,
        sessions: parsedSesion,
        category,
        price: Number(price),
        itemUsed: parsedItemUsed,
        downPercentage: Number(downPercentage),
        size: size,
        imageHash,
      });

      response.send("post created");
    } catch (error: any) {
      console.error(error);

      if (error?.code === 11000) {
        response.status(409).json(DUPLICATE_IMAGE_RESPONSE);
        return;
      }
      response.status(500).json({ error: "Upload failed" });
    }
  };

  static getAccountPosts = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const accountPost = await PostService.getByAccount(id);
    response.send(accountPost);
  };

  static getPostById = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const post = await PostService.get(id);
    response.send(post);
  };

  static deletePostById = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const post = await PostService.get(id);

    if (!post) {
      response.status(404).send("post not found");
      return;
    }

    if (post.account._id.toString() !== request.account?._id) {
      response.status(403).send("you are not authorized to delete this post");
      return;
    }

    const deletedPost = await PostService.softDelete(id);
    response.send(deletedPost);
  };

  static getDeletedAccountPosts = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id } = request.params;
    const deletedPosts = await PostService.getDeletedByAccount(id);
    response.send(deletedPosts);
  };

  static restorePostById = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const post = await PostService.get(id);

    if (!post) {
      response.status(404).send("post not found");
      return;
    }

    if (post.account._id.toString() !== request.account?._id) {
      response.status(403).send("you are not authorized to restore this post");
      return;
    }

    const restoredPost = await PostService.restore(id);
    response.send(restoredPost);
  };

  static updatePost = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const { tags, sessions, estimatedTime, category, price, downPercentage } =
      request.body;
    const updatedPost = await PostService.update(
      id,
      tags,
      category,
      estimatedTime,
      sessions,
      price,
      downPercentage,
    );
    response.send(updatedPost);
  };

  static getAllPosts = async (request: AuthRequest, response: Response) => {
    const allPosts = await PostService.getAll();
    response.send(allPosts);
  };
}
