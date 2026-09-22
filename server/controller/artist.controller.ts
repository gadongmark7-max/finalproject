import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { ArtistAnalyticsService, parseRangeDate } from "../services/artistAnalytics.service";
import { ExpencesService } from "../services/expences.service";

const requireArtist = (request: AuthRequest, response: Response): string | null => {
  const account = request.account;
  if (!account) {
    response.status(401).send("unauthorized");
    return null;
  }
  if (account.type !== "artist") {
    response.status(403).send("this feature is only available to artist accounts");
    return null;
  }
  return account._id;
};

export class ArtistController {
  static getDashboard = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const data = await ArtistAnalyticsService.getDashboard(artistId);
      response.send(data);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getReports = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const from = parseRangeDate(request.query.from, "start");
      const to = parseRangeDate(request.query.to, "end");

      if (from && to && from > to) {
        response.status(400).send("the 'from' date must be before the 'to' date");
        return;
      }

      const data = await ArtistAnalyticsService.getReport(artistId, { from, to });
      response.send(data);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static listExpenses = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const expenses = await ExpencesService.getByAccount(artistId);
      response.send(expenses);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static createExpense = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const { category, description, cost, date, notes } = request.body;
      const amount = Number(cost);

      if (!description || typeof description !== "string" || !description.trim()) {
        response.status(400).send("description is required");
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        response.status(400).send("cost must be a positive number");
        return;
      }
      if (!date || typeof date !== "string") {
        response.status(400).send("date is required");
        return;
      }

      const expense = await ExpencesService.create({
        account: artistId,
        category,
        description: description.trim(),
        cost: amount,
        date,
        notes: typeof notes === "string" ? notes.trim() : undefined,
        recordedBy: request.account?.name || "artist",
      });

      response.send(expense);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static updateExpense = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const { id } = request.params;
      const { category, description, cost, date, notes } = request.body;
      const amount = Number(cost);

      if (!description || typeof description !== "string" || !description.trim()) {
        response.status(400).send("description is required");
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        response.status(400).send("cost must be a positive number");
        return;
      }
      if (!date || typeof date !== "string") {
        response.status(400).send("date is required");
        return;
      }

      const updated = await ExpencesService.updateForAccount(id, artistId, {
        category,
        description: description.trim(),
        cost: amount,
        date,
        notes: typeof notes === "string" ? notes.trim() : undefined,
      });

      if (!updated) {
        response.status(404).send("expense not found");
        return;
      }

      response.send(updated);
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static deleteExpense = async (request: AuthRequest, response: Response) => {
    try {
      const artistId = requireArtist(request, response);
      if (!artistId) return;

      const { id } = request.params;
      const deleted = await ExpencesService.deleteForAccount(id, artistId);

      if (!deleted) {
        response.status(404).send("expense not found");
        return;
      }

      response.send({ deletedId: id });
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };
}
