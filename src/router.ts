import { Router } from "express";
import { schemas, validate } from "./middlewares/validator";
import AuthController from "./controllers/authController";
import ApplicationController from "./controllers/applicationController";
import { adminAuthMiddleware, authMiddleware, superAdminAuthMiddleware } from "./middlewares/authMiddleware";
import AdminController from "./controllers/adminController";
import CertificateController from "./controllers/certificateController";

const router = Router();

// Auth Routers
router.post("/auth/signup", validate(schemas.createUserSchema), AuthController.signup);
router.post("/auth/email/verify", validate(schemas.verifyUserEmailSchema), AuthController.verifyUserEmail);
router.post("/auth/email/request-verification", authMiddleware, AuthController.requestEmailVerification);
router.post("/auth/login", validate(schemas.loginUserSchema), AuthController.login);
router.post("/auth/forgot-password", validate(schemas.forgotPasswordSchema), AuthController.forgotPassword);
router.post("/auth/reset-password", validate(schemas.resetPasswordSchema), AuthController.resetPassword);
router.post("/auth/resend-otp", validate(schemas.forgotPasswordSchema), AuthController.resendOTP);

// Application Routers
router.post("/application", authMiddleware, validate(schemas.createApplicationSchema), ApplicationController.createApplication);
router.get("/application", authMiddleware, ApplicationController.getUserApplications);
router.get("/application/payment/verify", ApplicationController.verifyPayment);

// Super Admin Routers
router.post("/admin/signup", superAdminAuthMiddleware, validate(schemas.createAdminSchema), AdminController.signup);

// Admin Routers
router.post("/admin/login", validate(schemas.loginUserSchema), AdminController.login);
router.post("/admin/change-password", adminAuthMiddleware, validate(schemas.changePasswordSchema), AdminController.changePassword);
router.post("/admin/forgot-password", validate(schemas.forgotPasswordSchema), AdminController.forgotPassword);
router.post("/admin/reset-password", validate(schemas.resetPasswordSchema), AdminController.resetPassword);
router.post("/admin/resend-otp", validate(schemas.resetPasswordSchema), AdminController.resendOTP);
router.post("/admin/application/:id", adminAuthMiddleware, ApplicationController. approveApplicationsByAdmin);
router.get("/admin/applications/pending", adminAuthMiddleware, ApplicationController.getPendingApplications);
router.get("/admin/applications/approved", adminAuthMiddleware, ApplicationController.getApprovedApplications);
router.get("/admin/applications/rejected", adminAuthMiddleware, ApplicationController.getRejectedApplications);

// Certificate Routers
router.post("/certificate/request-verification/:id", authMiddleware, CertificateController.requestVerificationCode);
router.get("/certificate/payment/verify", CertificateController.verifyCertificateVerificationCodePayment);
router.get("/certificate/verify/:ref", CertificateController.confirmVerificationCode);
router.delete("/certificate/nullify-verification/:ref", CertificateController.nullifyVerificationCode);


export default router;