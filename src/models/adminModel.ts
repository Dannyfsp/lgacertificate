import mongoose, { Schema, Document } from "mongoose";

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

export interface IAdmin extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  password: string;
  resetPasswordOTP?: string | null | undefined;
  resetPasswordExpire?: Date | null | undefined;
  role: string;
  lga?: string;
  staffID?: string;
}

const adminSchema = new Schema<IAdmin>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  role: { type: String, enum: Object.values(AdminRole), default: AdminRole.ADMIN },
  password: { type: String, required: true },
  lga: { type: String },
  position: { type: String },
  staffID: { type: String },
  resetPasswordOTP: {type: String},
  resetPasswordExpire: {type: Date},
}, { timestamps: true });

const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;