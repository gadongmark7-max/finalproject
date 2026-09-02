import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { messageInterface, messageInterfaceInput, convoInterface, convoInterfaceInput } from "../types/convo.type";
import { MessageService } from "../services/message.service";
import { ConvoService } from "../services/convo.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";


export class ConvoController {

    static  getConvoId = async (request : AuthRequest , response : Response) => {
        const { p2ID } = request.params
        const account = request.account 
        const convo = await ConvoService.getByAccounts([p2ID, account!._id])
        if(convo){
            response.send(convo._id)
        } else {
            const newConvo =  await  ConvoService.create({
            accounts : [p2ID, account!._id],
            lastMessage : "none",
            chats : []
           })
           response.send(newConvo._id)
        }
    }

    static  getConvo = async (request : AuthRequest , response : Response) => {
        const { id } = request.params
        const convo = await ConvoService.get(id)
        response.send(convo)
    }

    static  getUserConvo = async (request : AuthRequest , response : Response) => {
        const account = request.account 
        const convos = await ConvoService.getByUser(account!._id)
        response.send(convos)
    }


    static  createMessage = async (request : AuthRequest , response : Response) => {
        const { convoId , message} = request.body
        const account = request.account

        const newMessage = await MessageService.create({
            message : message,
            type : "text",
            url : "none",
            sender : account!._id
        })

        await ConvoService.pushMessage(convoId, newMessage._id.toString())

        await ConvoService.updateLastMessage(convoId, message)

        const convo = await ConvoService.get(convoId)
        response.send(convo)
    }

    static  createMessageFile = async (request : AuthRequest , response : Response) => {
        try {
            if (!request.file) {
                response.status(400).json({ error: 'No file uploaded' });
                return;
            }
            
            const uploadResult = await cloudinary.uploader.upload(request.file.path, {
                folder: 'nextjs_uploads',
                resource_type: "auto",
        
            });
            
            fs.unlinkSync(request.file.path);
            
            const url = uploadResult.secure_url
        
            const fileType = uploadResult.resource_type
            
            const { convoId  } = request.body;
            
            const account = request.account
            
            const newMessage = await MessageService.create({
                message : "none",
                type : fileType,
                url : url,
                sender : account!._id
            })

            await ConvoService.pushMessage(convoId, newMessage._id.toString())

            await ConvoService.updateLastMessage(convoId, `sent a ${fileType}`)

            const convo = await ConvoService.get(convoId)
            response.send(convo)
            
             
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: 'Upload failed' });
        }
    }



}
