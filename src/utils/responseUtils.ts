import { Response } from "express";

export const successResponse = (res: Response, message: string, data: object) => {
    res.status(200).json({success: true, message, data});
}

export const errorResponse = (res: Response, message: string, statusCode: number) => {
    res.status(statusCode).json({success: false, message});
}