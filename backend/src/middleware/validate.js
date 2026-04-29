import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ApiError(400, messages.join(', ')));
  }
  next();
};

export const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  device: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    model: Joi.string().max(100).optional(),
    description: Joi.string().max(200).optional(),
    icon: Joi.string().optional(),
    color: Joi.string().optional(),
  }),
  geofence: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    center: Joi.object({ lat: Joi.number().required(), lng: Joi.number().required() }).required(),
    radius: Joi.number().min(50).max(50000).required(),
    devices: Joi.array().items(Joi.string()).optional(),
    color: Joi.string().optional(),
  }),
};
