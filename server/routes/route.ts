import { Router } from "express";
import accountRoute from "./account.route"
import authRoute from "./auth.route"
import worksRoute from "./works.route"
import postRoute from "./post.route"
import bookingRoute from "./booking.route"
import convoRoute from "./convo.route"
import inventoryRoute from "./inventory.route"
import contactRoute from "./contact.route"

const routes = Router()

routes.use("/account", accountRoute)
routes.use("/auth", authRoute)
routes.use("/works", worksRoute)
routes.use("/post", postRoute)
routes.use("/booking", bookingRoute)
routes.use("/convo", convoRoute)
routes.use("/inventory", inventoryRoute)
routes.use("/contact", contactRoute)

export default routes