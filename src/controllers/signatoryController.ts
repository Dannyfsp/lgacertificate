import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { errorResponse, successResponse } from "../utils/responseUtils";
import statesData from '../services/states.json';
import Signatory from "../models/signatoryModel";
import { uploadToCloudinary } from "../utils/upload";

const SignatoryController = {
    createSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {lga, chairmanName, secretaryName} = req.body;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const chairmanSignature = files["chairmanSignature"]?.[0];
            const secretarySignature = files["secretarySignature"]?.[0];

            if (!chairmanSignature || !secretarySignature) {
                return res.status(400).json({ message: "Both chairman signature and secretary signature are required" });
            }

            if (!["image/jpeg", "image/png", "image/jpg"].includes(chairmanSignature.mimetype)) {
                return errorResponse(res, "chairman signature must be a JPG or PNG image", 400);
            }
            
            if (!["image/jpeg", "image/png", "image/jpg"].includes(secretarySignature.mimetype)) {
                return errorResponse(res, "secretary signature must be a JPG or PNG image", 400);
            }

            // 2️⃣ Validate LGA within the selected state
            const validLgas = statesData["Ogun" as keyof typeof statesData];
            if (!validLgas.includes(lga)) {
                return errorResponse(res, "Invalid LGA for Ogun state", 400);
            }

            const signatoryExist = await Signatory.findOne({ lga });
            if (signatoryExist) return errorResponse(res, "Signatory already exist", 400);

            const [chairmanSignatureUrl, secretarySignatureUrl] = await Promise.all([
                uploadToCloudinary(chairmanSignature.buffer, "signatory", "image"),
                uploadToCloudinary(secretarySignature.buffer, "signatory", "image"),
            ]);

            const signatory = await Signatory.create({
                lga, 
                chairmanName, 
                secretaryName, 
                chairmanSignature: chairmanSignatureUrl,
                secretarySignature: secretarySignatureUrl, 
            });

            return successResponse(res, `Signatory for ${lga} LGA registered successfully`, signatory);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },
    
    updateSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {lga, chairmanName, secretaryName} = req.body;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const chairmanSignature = files["chairmanSignature"]?.[0];
            const secretarySignature = files["secretarySignature"]?.[0];

            if (!chairmanSignature || !secretarySignature) {
                return res.status(400).json({ message: "Both chairman signature and secretary signature are required" });
            }

            if (!["image/jpeg", "image/png", "image/jpg"].includes(chairmanSignature.mimetype)) {
                return errorResponse(res, "chairman signature must be a JPG or PNG image", 400);
            }
            
            if (!["image/jpeg", "image/png", "image/jpg"].includes(secretarySignature.mimetype)) {
                return errorResponse(res, "secretary signature must be a JPG or PNG image", 400);
            }

            // 2️⃣ Validate LGA within the selected state
            const validLgas = statesData["Ogun" as keyof typeof statesData];
            if (!validLgas.includes(lga)) {
                return errorResponse(res, "Invalid LGA for Ogun state", 400);
            }

            const signatoryExist = await Signatory.findOne({ lga });
            if (!signatoryExist) return errorResponse(res, "Signatory does not exist", 400);

            const shouldUpload = (signature: string) => {
                return !signature.startsWith('https://') && signature.startsWith('data:image');
            };

            const [chairmanSignatureUrl, secretarySignatureUrl] = await Promise.all([
                uploadToCloudinary(chairmanSignature.buffer, "signatory", "image"),
                uploadToCloudinary(secretarySignature.buffer, "signatory", "image"),
            ]);

            const signatory = await Signatory.findOneAndUpdate(
                { lga },
                { 
                    chairmanName, 
                    secretaryName, 
                    chairmanSignature: chairmanSignatureUrl,
                    secretarySignature: secretarySignatureUrl, 
                }
            );

            return successResponse(res, `Signatory for ${lga} LGA updated successfully`, {signatory});
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },
    
    getSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const lga = req.params.lga;

            // 2️⃣ Validate LGA within the selected state
            const validLgas = statesData["Ogun" as keyof typeof statesData];
            if (!validLgas.includes(lga)) {
                return errorResponse(res, "Invalid LGA for Ogun state", 400);
            }

            const signatory = await Signatory.findOne({ lga });
            if (!signatory) return errorResponse(res, "Signatory does not exist", 400);

            return successResponse(res, `Signatory for ${lga} LGA retrieved successfully`, signatory);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },
    
    deleteSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const lga = req.params.lga;

            // 2️⃣ Validate LGA within the selected state
            const validLgas = statesData["Ogun" as keyof typeof statesData];
            if (!validLgas.includes(lga)) {
                return errorResponse(res, "Invalid LGA for Ogun state", 400);
            }

            const signatory = await Signatory.findOne({ lga });
            if (!signatory) return errorResponse(res, "Signatory does not exist", 400);

            await Signatory.findOneAndDelete({lga});

            return successResponse(res, `Signatory for ${lga} LGA deleted successfully`, signatory);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },


}

export default SignatoryController;