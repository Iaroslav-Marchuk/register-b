import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(20).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).max(16).required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).max(16).required(),
});
