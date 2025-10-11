import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  password: string;
  resetPasswordOTP?: string | null | undefined;
  resetPasswordExpire?: Date | null | undefined;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordOTP: {type: String},
  resetPasswordExpire: {type: Date},
}, { timestamps: true });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
