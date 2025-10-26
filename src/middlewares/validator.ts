import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (schema: Joi.ObjectSchema<object>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(',');

      const newMessage = message.replace(/"/g, '');
      res.status(422).json({
        status: 'error',
        message: newMessage,
      });
    }
  };
};

const schemas = {
  createUserSchema: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    middleName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10,15}$/).required(), // Allow 10-15 digit phone numbers
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
        'any.only': 'Confirm password does not match password',
        }),
  }),
  
  superSignupSchema: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
        'any.only': 'Confirm password does not match password',
        }),
  }),
  
  createApplicationSchema: Joi.object().keys({
    fullNames: Joi.string().required(),
    fatherNames: Joi.string().required(),
    motherNames: Joi.string().required(),
    nativeTown: Joi.string().required(),
    nativePoliticalWard: Joi.string().required(),
    communityHead: Joi.string().required(),
    communityHeadContact: Joi.string().required(),
    village: Joi.string().required(),
    nin: Joi.string().pattern(/^\d{10,15}$/).required(), // Allow 10-15 digit phone numbers
    passport: Joi.string().required(),
    currentAddress: Joi.string().required(),
    lga: Joi.string().required(),
  }),
  
  loginUserSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  forgotPasswordSchema: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  
  verifyUserEmailSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }),

  resetPasswordSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Password and Confirm Password do not match',
      }),
  }),

  createAdminSchema: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    position: Joi.string().required(),
    staffID: Joi.string().required(),
    lga: Joi.string().required(),
    phone: Joi.string().pattern(/^\d{10,15}$/).required(), // Allow 10-15 digit phone numbers
  }),

  changePasswordSchema: Joi.object().keys({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required(),
    confirmNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
        'any.only': 'Confirm password does not match password',
        }),
  }),

};

export { validate, schemas };
