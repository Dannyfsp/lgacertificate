import { Router } from "express";
import { schemas, validate } from "./middlewares/validator";
import { forgotPassword, login, resendOTP, resetPassword, signup } from "./controllers/authController";
import { getUserApplications, verifyPayment } from "./controllers/applicationController";
import { authMiddleware } from "./middlewares/authMiddleware";

const router = Router();

// Auth Routers
router.post("/auth/signup", validate(schemas.createUserSchema), signup);
router.post("/auth/login", validate(schemas.loginUserSchema), login);
router.post("/auth/forgot-password", validate(schemas.forgotPasswordSchema), forgotPassword);
router.post("/auth/reset-password", validate(schemas.resetPasswordSchema), resetPassword);
router.post("/auth/resend-otp", validate(schemas.forgotPasswordSchema), resendOTP);

// Application Routers
router.post("/application", authMiddleware, validate(schemas.createApplicationSchema), require("./controllers/applicationController").createApplication);
router.get("/application", authMiddleware, getUserApplications);
router.get("/payment/verify", verifyPayment);


export default router;