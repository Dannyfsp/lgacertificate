import mongoose, { Schema, Document, Types } from "mongoose";

export interface IApplication extends Document {
  fullNames: string;
  nin?: string;
  fatherNames?: string;
  motherNames?: string;
  nativeTown?: string;
  nativePoliticalWard?: string;
  village?: string;
  communityHead?: string;
  communityHeadContact?: string;
  passport: string;
  passportPublicId?: string;
  docFromCommunityHead?: string | null;
  docFromCommunityHeadPublicId?: string | null;
  currentAddress: string;
  stateOfOrigin: string;
  lga: string;
  isResidentOfOgun?: boolean;
  lgaOfResident?: string | null;
  isApproved: boolean;
  isRejected: boolean;
  isPendingPayment: boolean;
  isPendingApproval: boolean;
  pendingPaymentLink: string | null;
  user: Types.ObjectId; // reference to User model
}

const applicationSchema = new Schema<IApplication>(
  {
    fullNames: { type: String, required: true },
    nin: { type: String },
    fatherNames: { type: String },
    motherNames: { type: String },
    nativeTown: { type: String },
    nativePoliticalWard: { type: String },
    village: { type: String },
    communityHead: { type: String },
    communityHeadContact: { type: String },
    passport: { type: String, required: true },
    passportPublicId: { type: String, required: true },
    docFromCommunityHead: { type: String },
    docFromCommunityHeadPublicId: { type: String },
    currentAddress: { type: String, required: true },
    lga: { type: String, required: true },
    stateOfOrigin: { type: String, required: true },
    isResidentOfOgun: { type: Boolean },
    lgaOfResident: { type: String },
    isApproved: { type: Boolean, default: false },
    isRejected: { type: Boolean, default: false },
    isPendingPayment: { type: Boolean, default: true },
    pendingPaymentLink: { type: String },
    isPendingApproval: { type: Boolean, default: false },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model<IApplication>("Application", applicationSchema);
export default Application;
