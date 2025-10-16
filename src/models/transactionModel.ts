import mongoose, { Schema, Document, Types } from "mongoose";

enum TransactionStatus {
  SUCCESSFUL = 'successful',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface ITransaction extends Document {
  transactionRef: string;
  amount: string;
  transactionId?: string;
  status?: string;
  user: Types.ObjectId; // reference to User model
  application: Types.ObjectId; // reference to Application model
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionRef: { type: String, required: true },
    amount: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
export default Transaction;
