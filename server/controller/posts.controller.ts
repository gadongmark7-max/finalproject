import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { postInterface, postInterfaceInput } from "../types/post.type";
import { PostService } from "../services/post.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";
import { NotificationService } from "../services/notifications.service";

export class PostController {

    static addPost = async (request : AuthRequest , response : Response) => {
        try {
            const { tags, category,  sessions, type, link, price, itemUsed, downPercentage, size } = request.body;

            let url;

            if(type == "newPost"){

                if (!request.file) {
                    response.status(400).json({ error: 'No file uploaded' });
                    return;
                }
    

                const uploadResult = await cloudinary.uploader.upload(request.file.path, {
                    folder: 'nextjs_uploads',
                });

                fs.unlinkSync(request.file.path);

                url = uploadResult.secure_url
            } else {
                url = link
            }

            const account = request.account

            const parsedTags = JSON.parse(tags)
            const parsedSesion = JSON.parse(sessions)
            const parsedItemUsed = JSON.parse(itemUsed)

            await PostService.create({
                account : account?._id!,
                postImg : url,
                tags : parsedTags,
                sessions : parsedSesion,
                category,
                price : Number(price),
                itemUsed : parsedItemUsed,
                downPercentage : Number(downPercentage),
                size : size
            })

            response.send("post created")

            
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: 'Upload failed' });
        }
    }


    static getAccountPosts = async (request : AuthRequest , response : Response) => {
        const { id } = request.params
        const accountPost = await PostService.getByAccount(id)
        response.send(accountPost)
    }

    static getPostById = async (request : AuthRequest , response : Response) => {
        const { id } = request.params
        const post = await PostService.get(id)
        response.send(post)
    }

    static deletePostById = async (request : AuthRequest , response : Response) => {
        const { id } = request.params
        const post = await PostService.delete(id)
        response.send(post)
    }

    static updatePost = async (request : AuthRequest , response : Response) => {
        const { id } = request.params
        const { tags, sessions, estimatedTime,  category, price , downPercentage} = request.body
        const updatedPost = await PostService.update(id,tags, category, estimatedTime, sessions, price, downPercentage)
        response.send(updatedPost)
    }


    static getAllPosts = async (request : AuthRequest , response : Response) => {
        const allPosts = await PostService.getAll()
        response.send(allPosts)
    }

}
