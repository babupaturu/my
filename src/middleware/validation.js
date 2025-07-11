
import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required()
});

export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().positive().required()
});

export const createOrderSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer').required()
});

export const reviewSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().max(200).optional(),
  comment: Joi.string().max(1000).optional()
});
