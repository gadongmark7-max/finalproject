import { Response, response } from "express";
import { AuthRequest } from "../types/request.type";
import { worksInterfaceInput, worksInterface } from "../types/works.type";
import { WorksService } from "../services/works.service";

export class WorksController {
  static create = async (request: AuthRequest, response: Response) => {
    try {
      const acccount = request.account;
      const { design, screenShot } = request.body;
      const newWork: worksInterfaceInput = {
        artist: acccount?._id!,
        design: design,
        screenShot: screenShot,
      };
      await WorksService.create(newWork);
      response.send("sucess");
    } catch (e) {
      console.log(e);
      response.status(500).send("error occur");
    }
  };

  static getArtistWorks = async (request: AuthRequest, response: Response) => {
    const acccount = request.account;
    const works = await WorksService.getByArtist(acccount?._id!);
    response.send(works);
  };

  static getWork = async (request: AuthRequest, response: Response) => {
    const { id } = request.params;
    const work = await WorksService.getById(id);
    response.send(work);
  };

  static deleteWork = async (request: AuthRequest, response: Response) => {
    const acccount = request.account;
    const { id } = request.params;
    await WorksService.delete(id);
    const works = await WorksService.getByArtist(acccount?._id!);
    response.send(works);
  };

  static updateArtistWork = async (
    request: AuthRequest,
    response: Response,
  ) => {
    const { id, design, screenShot } = request.body;
    await WorksService.updateWorks(id, design, screenShot);
    response.send("sucess");
  };
}
