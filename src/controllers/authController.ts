import { Request, Response } from "express";
import User from "../models/userModel";
import { errorResponse, successResponse } from "../utils/responseUtils";
import { compareHash, hash } from "../utils/hash";
import { generateToken } from "../utils/jwtHandler";
import emitter from "../utils/common/eventlisteners";

// SIGNUP
export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, middleName, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return errorResponse(res, "Email already registered", 400);

    const hashedPassword = await hash(password);

    const user = await User.create({
      firstName,
      lastName,
      middleName,
      email,
      phone,
      password: hashedPassword
    });

    return successResponse(res,  "User registered successfully", {})
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "Invalid credentials", 400);

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid credentials", 400);

    const token = generateToken({id: user._id, email: user.email});

    const userObj: any = user.toObject();
    delete userObj.password;
    delete userObj.resetPasswordExpire;
    delete userObj.resetPasswordOTP;

    return successResponse(res, "Logged in successfully", {token, userObj})
 } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

// FORGOT PASSWORD (generate OTP)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return errorResponse(res, "User not found", 404);

    // Check 1-minute cooldown using resetPasswordExpire as reference
    const now = Date.now();
    if (user.resetPasswordExpire) {
      // The OTP was originally sent 10 minutes before the expire time
      const otpSentAt = user.resetPasswordExpire.getTime() - 10 * 60 * 1000;

      // If it's been less than 1 minute since that time, block new OTP
      if (now - otpSentAt < 60 * 1000) {
        return errorResponse(res, "Please wait before requesting a new OTP", 429);
      }
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = await hash(otp);

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // valid 10 mins
    await user.save();

    emitter.emit('forgot-password', {
        email: user.email,
        otp: otp,
        name: user.firstName
      });
  
    return successResponse(res, "OTP sent to email", {email: user.email});
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

// RESET PASSWORD USING OTP
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found", 404);

    // Check if OTP or expiration is missing/expired
    if (
      !user.resetPasswordOTP ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire < new Date()
    ) {
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    // Compare provided OTP with hashed one in DB
    const isOTPMatch = await compareHash(otp, user.resetPasswordOTP);
    if (!isOTPMatch) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return errorResponse(res, "Invalid or expired OTP", 400);
    }

    // OTP is valid → update password
    user.password = await hash(password);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return successResponse(res, "Password reset successful", {});
  } catch (err: any) {
    console.error(err);
    return errorResponse(res, err.message, 500);
  }
};


// RESEND OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found", 404);

    // Check 1-minute cooldown using resetPasswordExpire as reference
    const now = Date.now();
    if (user.resetPasswordExpire) {
      // The OTP was originally sent 10 minutes before the expire time
      const otpSentAt = user.resetPasswordExpire.getTime() - 10 * 60 * 1000;

      // If it's been less than 1 minute since that time, block new OTP
      if (now - otpSentAt < 60 * 1000) {
        return errorResponse(res, "Please wait before requesting a new OTP", 429);
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hash(otp);

    // Save hashed OTP and new expiry
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await user.save();

    emitter.emit("forgot-password", {
      email: user.email,
      otp: otp, // send raw OTP here (not hashed)
      name: user.firstName,
    });

    return successResponse(res, "OTP resent successfully", {
      email: user.email,
    });
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};