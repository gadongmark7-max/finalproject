import { Response, response } from "express";
import { isValidObjectId } from "mongoose";
import { AuthRequest } from "../types/request.type";
import {
  messageInterface,
  messageInterfaceInput,
  convoInterface,
  convoInterfaceInput,
} from "../types/convo.type";
import { MessageService } from "../services/message.service";
import { ConvoService } from "../services/convo.service";
import { AccountService } from "../services/acccount.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";

async function participantConvo(convoId: unknown, userId: string) {
  if (typeof convoId !== "string" || !isValidObjectId(convoId)) return null;
  return await ConvoService.findForParticipant(convoId, userId);
}

export class ConvoController {
  static getConvoId = async (request: AuthRequest, response: Response) => {
    const { p2ID } = request.params;
    const account = request.account;
    if (
      !isValidObjectId(p2ID) ||
      p2ID === account!._id ||
      !(await AccountService.get(p2ID))
    ) {
      response.status(400).json({ error: "Invalid conversation participant" });
      return;
    }
    response.send(await ConvoService.getOrCreateId(account!._id, p2ID));
  };

  static getArtistConvo = async (request: AuthRequest, response: Response) => {
    const account = request.account;
    if (account!.type !== "client") {
      response
        .status(403)
        .json({ error: "Only clients can message the artist here" });
      return;
    }
    const artist = await AccountService.getShopArtist();
    if (!artist) {
      response
        .status(404)
        .json({ error: "The artist is not available right now" });
      return;
    }
    response.send({
      artist: { _id: artist._id, name: artist.name, profile: artist.profile },
      convoId: await ConvoService.findIdByAccounts(
        account!._id,
        artist._id.toString(),
      ),
    });
  };

  static openArtistConvo = async (request: AuthRequest, response: Response) => {
    const account = request.account;
    if (account!.type !== "client") {
      response
        .status(403)
        .json({ error: "Only clients can message the artist here" });
      return;
    }
    const artist = await AccountService.getShopArtist();
    if (!artist) {
      response
        .status(404)
        .json({ error: "The artist is not available right now" });
      return;
    }
    response.send(
      await ConvoService.getOrCreateId(account!._id, artist._id.toString()),
    );
  };

  static getUnreadCount = async (request: AuthRequest, response: Response) => {
    const account = request.account;
    const chatIds = await ConvoService.getChatIdsByUser(account!._id);
    const count = await MessageService.countUnread(chatIds, account!._id);
    response.send({ count });
  };

  // Opening a conversation marks the other participant's messages as read.
  static getConvo = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const account = request.account;
    const owned = await participantConvo(id, account!._id);
    if (!owned) {
      response.status(404).json({ error: "Conversation not found" });
      return;
    }
    await MessageService.markRead(owned.chats, account!._id);
    const convo = await ConvoService.get(id);
    response.send(convo);
  };

  static getUserConvo = async (request: AuthRequest, response: Response) => {
    const account = request.account;
    const convos = await ConvoService.getByUser(account!._id);
    response.send(convos);
  };

  static createMessage = async (request: AuthRequest, response: Response) => {
    const { convoId, message } = request.body;
    const account = request.account;

    if (typeof message !== "string" || !message.trim()) {
      response.status(400).json({ error: "Message is empty" });
      return;
    }
    if (!(await participantConvo(convoId, account!._id))) {
      response.status(404).json({ error: "Conversation not found" });
      return;
    }

    const newMessage = await MessageService.create({
      message: message,
      type: "text",
      url: "none",
      sender: account!._id,
    });

    await ConvoService.pushMessage(convoId, newMessage._id.toString());

    await ConvoService.updateLastMessage(convoId, message);

    const convo = await ConvoService.get(convoId);
    response.send(convo);
  };

  static createMessageFile = async (
    request: AuthRequest,
    response: Response,
  ) => {
    try {
      if (!request.file) {
        response.status(400).json({ error: "No file uploaded" });
        return;
      }

      if (
        !(await participantConvo(request.body.convoId, request.account!._id))
      ) {
        fs.unlinkSync(request.file.path);
        response.status(404).json({ error: "Conversation not found" });
        return;
      }

      const uploadResult = await cloudinary.uploader.upload(request.file.path, {
        folder: "nextjs_uploads",
        resource_type: "auto",
      });

      fs.unlinkSync(request.file.path);

      const url = uploadResult.secure_url;

      const fileType = uploadResult.resource_type;

      const { convoId } = request.body;

      const account = request.account;

      const newMessage = await MessageService.create({
        message: "none",
        type: fileType,
        url: url,
        sender: account!._id,
      });

      await ConvoService.pushMessage(convoId, newMessage._id.toString());

      await ConvoService.updateLastMessage(convoId, `sent a ${fileType}`);

      const convo = await ConvoService.get(convoId);
      response.send(convo);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Upload failed" });
    }
  };
}
