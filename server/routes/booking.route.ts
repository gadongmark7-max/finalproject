import { Router } from "express";
import { BookingController } from "../controller/booking.controller";
import { authenticateJWT } from "../middleware/auth";
import { upload } from "../utils/upload";


const route = Router()

route.post("/", authenticateJWT,  BookingController.createBooking)
route.get("/:id", authenticateJWT, BookingController.getBooking)
route.post("/appointment", authenticateJWT,  BookingController.createAppointment)
route.post("/custom", authenticateJWT, upload.single("file"), BookingController.customBooking)
route.get("/bussiness/completed/:id", authenticateJWT, BookingController.getBusinessCompletedBooking)
route.get("/artist/:id", authenticateJWT, BookingController.getArtistBooking)
route.get("/client/:id", authenticateJWT, BookingController.getClientBooking)
route.get("/bussiness/:id", authenticateJWT, BookingController.getBussinessBooking)
route.put("/status", authenticateJWT, BookingController.updateBookingStatus)
route.delete("/appointment/:id", authenticateJWT, BookingController.completeAppointment)
route.post("/bookNextSession", authenticateJWT, BookingController.bookNextSession)
route.post("/resched", authenticateJWT, BookingController.ReschedBooking)
route.post("/payment", authenticateJWT, BookingController.bookingPayment)
route.post("/cashPayment", authenticateJWT, BookingController.bookingCashPayment)

export default route