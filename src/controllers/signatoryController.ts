import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { errorResponse, successResponse } from "../utils/responseUtils";
import statesData from '../services/states.json';
import Signatory from "../models/signatoryModel";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/upload";

const SignatoryController = {
    createSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {lga, chairmanName, secretaryName} = req.body;
            const admin = req.user;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const chairmanSignature = files["chairmanSignature"]?.[0];
            const secretarySignature = files["secretarySignature"]?.[0];

            if (!chairmanSignature || !secretarySignature) {
                return errorResponse(res, "Both chairman signature and secretary signature are required", 400);
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

            if (lga !== admin.lga) return errorResponse(res, "request revoked: officials can only register signatories relating to their respective LGA", 400);

            const signatoryExist = await Signatory.findOne({ lga });
            if (signatoryExist) return errorResponse(res, "Signatory already exist", 400);

            const [chairmanSignatureData, secretarySignatureData] = await Promise.all([
                uploadToCloudinary(chairmanSignature.buffer, "signatory", "image"),
                uploadToCloudinary(secretarySignature.buffer, "signatory", "image"),
            ]);

            const signatory = await Signatory.create({
                lga, 
                chairmanName, 
                secretaryName, 
                chairmanSignature: chairmanSignatureData.secureUrl,
                chairmanSignaturePublicId: chairmanSignatureData.publicId,
                secretarySignature: secretarySignatureData.secureUrl, 
                secretarySignaturePublicId: secretarySignatureData.publicId, 
            });

            return successResponse(res, `Signatory for ${lga} LGA registered successfully`, signatory);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },
    
    updateSignatory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {lga, chairmanName, secretaryName} = req.body;
            
            const admin = req.user

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

            if (lga !== admin.lga) return errorResponse(res, "request revoked: officials can only update signatories relating to their respective LGA", 400);
            
            const signatoryExist = await Signatory.findOne({ lga });
            if (!signatoryExist) return errorResponse(res, "Signatory does not exist", 400);

            await Promise.all([
                deleteFromCloudinary(signatoryExist.chairmanSignaturePublicId, "image"),
                deleteFromCloudinary(signatoryExist.secretarySignaturePublicId, "image"),
            ]);

            const [chairmanSignatureData, secretarySignatureData] = await Promise.all([
                uploadToCloudinary(chairmanSignature.buffer, "signatory", "image"),
                uploadToCloudinary(secretarySignature.buffer, "signatory", "image"),
            ]);

            const signatory = await Signatory.findOneAndUpdate(
                { lga },
                { 
                    chairmanName, 
                    secretaryName, 
                    chairmanSignature: chairmanSignatureData.secureUrl,
                    chairmanSignaturePublicId: chairmanSignatureData.publicId,
                    secretarySignature: secretarySignatureData.secureUrl, 
                    secretarySignaturePublicId: secretarySignatureData.publicId, 
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
            const admin = req.user;

            const validLgas = statesData["Ogun" as keyof typeof statesData];
            if (!validLgas.includes(lga)) {
                return errorResponse(res, "Invalid LGA for Ogun state", 400);
            }

            if (lga !== admin.lga) return errorResponse(res, "request revoked: officials can only delete signatories relating to their respective LGA", 400);

            const signatory = await Signatory.findOne({ lga });
            if (!signatory) return errorResponse(res, "Signatory does not exist", 400);


            await Promise.all([
                deleteFromCloudinary(signatory.chairmanSignaturePublicId, "image"),
                deleteFromCloudinary(signatory.secretarySignaturePublicId, "image"),
            ]);

            await Signatory.findOneAndDelete({lga});

            return successResponse(res, `Signatory for ${lga} LGA deleted successfully`, signatory);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    },


}

export default SignatoryController;