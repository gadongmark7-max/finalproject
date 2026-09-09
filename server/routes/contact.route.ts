import { Router } from "express";
import { ContactController } from "../controller/contact.controller";

const route = Router()

route.post("/", ContactController.sendConsultation)

export default route
