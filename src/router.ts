import { Router } from "express";
import { schemas, validate } from "./middlewares/validator";
import { forgotPassword, login, requestEmailVerification, resendOTP, resetPassword, signup, verifyUserEmail } from "./controllers/authController";
import { approveApplicationsByAdmin, createApplication, getApprovedApplications, getPendingApplications, getRejectedApplications, getUserApplications, verifyPayment } from "./controllers/applicationController";
import { adminAuthMiddleware, authMiddleware, superAdminAuthMiddleware } from "./middlewares/authMiddleware";
import { adminLogin, adminSignup } from "./controllers/adminController";

const router = Router();

// Auth Routers
router.post("/auth/signup", validate(schemas.createUserSchema), signup);
router.post("/auth/email/verify", validate(schemas.verifyUserEmailSchema), verifyUserEmail);
router.post("/auth/email/request-verification", authMiddleware, requestEmailVerification);
router.post("/auth/login", validate(schemas.loginUserSchema), login);
router.post("/auth/forgot-password", validate(schemas.forgotPasswordSchema), forgotPassword);
router.post("/auth/reset-password", validate(schemas.resetPasswordSchema), resetPassword);
router.post("/auth/resend-otp", validate(schemas.forgotPasswordSchema), resendOTP);

// Application Routers
router.post("/application", authMiddleware, validate(schemas.createApplicationSchema), createApplication);
router.get("/application", authMiddleware, getUserApplications);
router.get("/payment/verify", verifyPayment);

// Super Admin Routers
router.post("/admin/signup", superAdminAuthMiddleware, validate(schemas.createAdminSchema), adminSignup);

// Admin Routers
router.post("/admin/login", adminAuthMiddleware, validate(schemas.loginUserSchema), adminLogin);
router.post("/admin/application/:id", adminAuthMiddleware, approveApplicationsByAdmin);
router.get("/admin/applications/pending", adminAuthMiddleware, getPendingApplications);
router.get("/admin/applications/approved", adminAuthMiddleware, getApprovedApplications);
router.get("/admin/applications/rejected", adminAuthMiddleware, getRejectedApplications);


export default router;