import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/responseUtils';
import Application from '../models/applicationModel';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { generateTransactionRef } from '../utils/hash';
import { restClientWithHeaders } from '../utils/apiCalls/restcall';
import { IBaseResponse } from '../utils/apiCalls/IResponse';
import { config } from '../config/app';
import mongoose from 'mongoose';
import Transaction, {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from '../models/transactionModel';
import { AppError } from '../utils/appError';
import { uploadBase64ToCloudinary } from '../utils/upload';
import Certificate from '../models/certificationModal';
import CertificateService from '../services/certificateService';

const ApplicationController = {
  createApplication: async (req: AuthenticatedRequest, res: Response) => {
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
        passport,
      } = req.body;

      const existingApplication = await Application.findOne({ nin, isPending: true });
      if (existingApplication) {
        await session.abortTransaction();
        return errorResponse(res, 'Existing application pending', 400);
      }

      const passportUrl = await uploadBase64ToCloudinary(passport);

      const transactionRef = generateTransactionRef();

      const paymentPayload = {
        tx_ref: transactionRef,
        amount: '10000',
        currency: 'NGN',
        redirect_url: `${config.app.URL}/api/v1/application/payment/verify`,
        customer: {
          email: user.email,
          name: fullNames,
          phone_number: user.phone,
        },
        customizations: {
          title: 'LGA Certificate Application Payment',
        },
      };

      const response: IBaseResponse = await restClientWithHeaders(
        'POST',
        `${config.payments.URI}payments`,
        paymentPayload,
        {
          Authorization: `Bearer ${config.payments.SECRET}`,
        }
      );

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
        amount: '10000',
        transactionType: TransactionType.APPLICATION,
        user: user._id,
        application: application._id,
      });
      await transaction.save({ session });
      await session.commitTransaction();

      return successResponse(res, 'redirect to payment link', {
        txRef: transactionRef,
        paymentLink: response?.data?.link,
      });
    } catch (err: any) {
      await session.abortTransaction();
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
      }
      return errorResponse(res, err.message, 500);
    } finally {
      session.endSession();
    }
  },

  verifyPayment: async (req: AuthenticatedRequest, res: Response) => {
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
        { Authorization: `Bearer ${config.payments.SECRET}` }
      );

      if (response?.status !== 'success') {
        await session.abortTransaction();
        return errorResponse(res, 'an error has occurred', 500);
      }

      if (response.data.status === 'pending') {
        transaction.transactionId = Number(transactionId);
        await transaction.save({ session });
        await session.commitTransaction();
        return errorResponse(res, 'transaction still pending', 400);
      }
      if (response.data.status !== 'successful') {
        transaction.status = 'failed';
        transaction.transactionId = Number(transactionId);
        await transaction.save({ session });
        await session.commitTransaction();
        return errorResponse(res, 'transaction failed', 400);
      }

      transaction.status = TransactionStatus.SUCCESSFUL;
      transaction.transactionId = Number(transactionId);
      transaction.providerRef = response?.data?.flw_ref;
      await transaction.save({ session });

      const application = await Application.findById(transaction.application);
      if (!application) {
        await session.abortTransaction();
        return errorResponse(res, 'application not found', 404);
      }
      application.isPendingPayment = false;
      application.isPendingApproval = true;
      await application.save({ session });

      await session.commitTransaction();
      return res.redirect(`${config.app.FRONT_END_URL}/successful?ref=${transactionRef}`);
    } catch (err: any) {
      await session.abortTransaction();
      return errorResponse(res, err.message, 500);
    } finally {
      session.endSession();
    }
  },

  getUserApplications: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      const applications = await Application.find({ user: user._id }).sort({ createdAt: -1 });
      return successResponse(res, 'applications retrieved successfully', { applications });
    } catch (err: any) {
      return errorResponse(res, err.message, 500);
    }
  },

  getPendingApplications: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await Application.find({
        isApproved: false,
        isRejected: false,
        isPendingApproval: true,
      }).sort({ createdAt: -1 });
      return successResponse(res, 'pending application retrieved successfully', { applications });
    } catch (err: any) {
      return errorResponse(res, err.message, 500);
    }
  },

  getApprovedApplications: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await Application.find({ isApproved: true }).sort({ createdAt: -1 });
      return successResponse(res, 'approved application retrieved successfully', { applications });
    } catch (err: any) {
      return errorResponse(res, err.message, 500);
    }
  },

  getRejectedApplications: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const applications = await Application.find({ isRejected: true }).sort({ createdAt: -1 });
      return successResponse(res, 'rejected application retrieved successfully', { applications });
    } catch (err: any) {
      return errorResponse(res, err.message, 500);
    }
  },

  approveApplicationsByAdmin: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id;
      const approve = req.query.approve;

      const application = await Application.findById(id);
      if (!application) {
        return errorResponse(res, 'application not found', 404);
      }

      if (application.isApproved) return errorResponse(res, 'application already approved', 400);
      if (application.isRejected) return errorResponse(res, 'application already rejected', 400);
      if (application.isPendingPayment)
        return errorResponse(res, 'application payment not yet completed', 400);

      if (approve === 'true') {
        application.isApproved = true;
        application.isPendingApproval = false;
      } else {
        application.isRejected = true;
        application.isPendingApproval = false;
      }
      await application.save();

      const certificateRef = await CertificateService.certificateReference();

      await Certificate.create({
        certificateRef,
        application: application._id,
        user: application.user,
      });

      return successResponse(res, 'application approved successfully', { application });
    } catch (err: any) {
      return errorResponse(res, err.message, 500);
    }
  },
};

export default ApplicationController;
