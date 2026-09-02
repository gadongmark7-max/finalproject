import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { AccountController } from "../controller/accounts.controller";

const route = Router()

route.post("/register", AuthController.register)
route.post("/login", AuthController.login)
route.post("/otp", AuthController.submitOtp)
route.post("/resend", AuthController.resendOtp)
route.post("/forgotPassword/otp", AccountController.forgotPasswordOtp)
route.post("/forgotPassword/verify", AccountController.verifyForgotPasswordOtp)
route.put("/forgotPassword/update", AccountController.updateForgotPassword)


export default route