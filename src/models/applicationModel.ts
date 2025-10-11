import mongoose, { Schema, Document, Types } from "mongoose";

export interface IApplication extends Document {
  fullNames: string;
  nin: string;
  fatherNames: string;
  motherNames: string;
  nativeTown: string;
  nativePoliticalWard: string;
  village: string;
  communityHead: string;
  passport: string;
  currentAddress: string;
  lga: string;
  isApproved: boolean;
  isPending: boolean;
  user: Types.ObjectId; // reference to User model
}

const applicationSchema = new Schema<IApplication>(
  {
    fullNames: { type: String, required: true },
    nin: { type: String, required: true },
    fatherNames: { type: String, required: true },
    motherNames: { type: String, required: true },
    nativeTown: { type: String, required: true },
    nativePoliticalWard: { type: String, required: true },
    village: { type: String, required: true },
    communityHead: { type: String, required: true },
    passport: { type: String, required: true },
    currentAddress: { type: String, required: true },
    lga: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    isPending: { type: Boolean, default: false },
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
