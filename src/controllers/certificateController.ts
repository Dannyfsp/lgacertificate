import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { errorResponse } from "../utils/responseUtils";
import Certificate from "../models/certificationModal";

const CertificateController = {
    requestVerificationCode: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const user = req.user;

            const certificate = await Certificate.findOne({user: user._id});
            if (!certificate) return errorResponse(res, "No certificate found for user", 404);
            
            if (certificate.isVerificationCodeGenerated) return errorResponse(res, "Verification code already generated", 400); 
            
        } catch (err: any) {
           return errorResponse(res, err.message, 500); 
        }
    },

    confirmVerificationCode: async (req: Request, res: Response) => {
        try {
            
        } catch (err: any) {
            return errorResponse(res, err.message, 500);
        }
    },
}

export default CertificateController;