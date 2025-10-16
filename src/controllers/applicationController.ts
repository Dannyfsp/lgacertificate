import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseUtils";
import Application from "../models/applicationModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { generateTransactionRef } from "../utils/hash";
import { restClientWithHeaders } from "../utils/apiCalls/restcall";
import { IBaseResponse } from "../utils/apiCalls/IResponse";
import { config } from "../config/app";
import mongoose from "mongoose";
import Transaction, { ITransaction } from "../models/transactionModel";
import { AppError } from "../utils/appError";
import { uploadBase64ToCloudinary } from "../utils/upload";

export const createApplication = async (req: AuthenticatedRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  try {
    const user = req.user;
    const { 
        fullNames, 
        fatherNames,
        motherNames, 
        nativeTown, 
        nativePoliticalWard, 
        village, 
        communityHead, 
        currentAddress, 
        lga, 
        nin,
        passport 
    } = req.body;

    const existingApplication = await Application.findOne({nin, isPending: true});
    if (existingApplication) {
      await session.abortTransaction();
      return errorResponse(res, "Existing application pending", 400);
    } 

    const passportUrl = await uploadBase64ToCloudinary(passport);

    const transactionRef = generateTransactionRef();

    const paymentPayload = {
        tx_ref: transactionRef,
        amount: "10000",
        currency: 'NGN',
        redirect_url: `https://ajothrift-959d57d1f68d.herokuapp.com/api/v1/payment/verify`,
        customer: {
          email: user.email,
          name: fullNames,
          phone_number: user.phone,
        },
        customizations: {
          title: 'Flutterwave Standard Payment',
        }
    };

    const response: IBaseResponse = await restClientWithHeaders('POST', `${config.payments.URI}payments`, paymentPayload, {
        Authorization: `Bearer ${config.payments.SECRET}`,
    });

    console.log(response);    

    if (response.status !== 'success') {
        await session.abortTransaction();
        return errorResponse(res, 'an error has occurred', 500);
    }

    const application = new Application({
        fullNames, 
        fatherNames,
        motherNames, 
        nativeTown, 
        nativePoliticalWard, 
        village, 
        communityHead, 
        currentAddress, 
        lga, 
        nin,
        passport: passportUrl,
        user: user._id,
    });

    await application.save({ session });

    const transaction = new Transaction({
        transactionRef,
        amount: "10000",
        transactionId: response?.data?.id,
        user: user._id,
        application: application._id
    })
    await transaction.save({ session });
    await session.commitTransaction();

    return successResponse(res,  "redirect to payment link", { txRef: transactionRef, paymentLink: response?.data?.link });
  } catch (err: any) {
    await session.abortTransaction();
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    return errorResponse(res, err.message, 500);
  } finally {
    session.endSession();
  }
};

export const verifyApplication = async (req: AuthenticatedRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  try {
    const transactionRef = req.query.tx_ref;
    const status = req.query.status;
    const transactionId = req.query.transaction_id;

    if (!transactionRef || !status || !transactionId) {
        await session.abortTransaction();
        return errorResponse(res, 'missing required query parameters', 400);
    }

    const transaction: ITransaction | null = await Transaction.findOne({ transactionRef });
    if (!transaction) {
        await session.abortTransaction();
        return errorResponse(res, 'wrong transaction reference', 400);
    }

    if (status === 'failed') {
        transaction.status = 'failed';
        await transaction.save({ session });
        await session.commitTransaction();
        return errorResponse(res, 'transaction failed', 400);
    }

    if (transaction.status === 'successful') {
        await session.abortTransaction();
        return successResponse(res, 'transaction successful', { transaction });
    }

    const response: IBaseResponse = await restClientWithHeaders(
        'GET',
        `${config.payments.URI}transactions/${Number(transactionId)}/verify`,
        { null: null },
        { Authorization: `Bearer ${config.payments.SECRET}` },
    );

    if (response?.status !== 'success') {
        await session.abortTransaction();
        return errorResponse(res, 'an error has occurred', 500);
    }

    if (response.data.status === 'pending') {
        transaction.transactionId = transactionId as string;
        await transaction.save({ session });
        await session.commitTransaction();
        return errorResponse(res, 'transaction still pending', 400);
    }
    if (response.data.status !== 'successful') {
        transaction.status = 'failed';
        transaction.transactionId = transactionId as string;
        await transaction.save({ session });
        await session.commitTransaction();
        return errorResponse(res, 'transaction failed', 400);
    }

    transaction.status = 'successful';
    await transaction.save({ session });

    const application = await Application.findById(transaction.application);
    if (!application) {
        await session.abortTransaction();
        return errorResponse(res, 'application not found', 404);
    }
    application.isApproved = true;
    await application.save({ session });
    return successResponse(res,  "transaction successful", { application });
  } catch (err: any) {
    await session.abortTransaction();
    return errorResponse(res, err.message, 500);
  } finally {
    session.endSession();
  }
};