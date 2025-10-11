import jwt from 'jsonwebtoken';
import { config } from '../config/app';

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, config.app.JWT_SECRET as string, {expiresIn: "7d"});
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.app.JWT_SECRET as string);
};

export const generateAdminToken = (payload: object): string => {
    return jwt.sign(payload, config.app.ADMIN_JWT_SECRET as string, {expiresIn: "1hr"});
};

export const verifyAdminToken = (token: string) => {
  return jwt.verify(token, config.app.ADMIN_JWT_SECRET as string);
};