const Joi = require('joi');

// Validation schemas
const schemas = {
  signIn: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
  }),

  createUser: Joi.object({
    email: Joi.string().email().required(),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required(),
    retypePassword: Joi.string().valid(Joi.ref('password')).required()
  }),

  rentNow: Joi.object({
    productId: Joi.string().min(1).max(50).required(),
    customerName: Joi.string().min(2).max(100).required(),
    customerNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    customerPAN: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
    customerAadhar: Joi.string().pattern(/^[0-9]{12}$/).required(),
    fromDate: Joi.date().iso().required(),
    toDate: Joi.date().iso().greater(Joi.ref('fromDate')).required()
  }),

  makeAvailable: Joi.object({
    productId: Joi.string().min(1).max(50).required()
  }),

  signOut: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
  }),

  updateRental: Joi.object({
    productId: Joi.string().min(1).max(50).required(),
    customerNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    toDate: Joi.date().iso().required(),
    totalPaid: Joi.number().min(0).required()
  }),

  addProduct: Joi.object({
    photos: Joi.array().items(Joi.string().uri()).min(1).required(),
    name: Joi.string().min(2).max(100).required(),
    model: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('bike', 'car').required(),
    availability: Joi.string().valid('available', 'rented').required(),
    manufacturingYear: Joi.number().integer().min(1980).max(new Date().getFullYear()).required(),
    rate: Joi.number().positive().required()
  }),

  updateVehicle: Joi.object({
    id: Joi.string().min(1).max(50).required(),
    photos: Joi.array().items(Joi.string().uri()).min(1).required(),
    name: Joi.string().min(2).max(100).required(),
    model: Joi.string().min(2).max(100).required(),
    manufacturingYear: Joi.number().integer().min(1980).max(new Date().getFullYear()).required(),
    rate: Joi.number().positive().required()
  }),

  // Profile update schemas
  updateProfile: Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(''),
    profilePhoto: Joi.string().optional() // Base64 encoded image
  }),

  // Change password schemas
  changePasswordStep1: Joi.object({
    currentPassword: Joi.string().min(6).max(100).required(),
    newPassword: Joi.string().min(6).max(100).required()
  }),

  changePasswordStep2: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    newPassword: Joi.string().min(6).max(100).required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required()
  }),

  // Forgot Password schemas
  verifyPhone: Joi.object({
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required()
  }),

  verifyOTP: Joi.object({
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required()
  }),

  updateUser: Joi.object({
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    newPassword: Joi.string().min(6).max(100).required()
  }),

  // Admin authentication schemas
  adminOTP: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required()
  })
};

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        status: 'failure',
        message: `Validation error: ${errorMessage}`
      });
    }
    
    next();
  };
};

// Export validation middleware for each endpoint
module.exports = {
  signIn: validate(schemas.signIn),
  createUser: validate(schemas.createUser),
  rentNow: validate(schemas.rentNow),
  makeAvailable: validate(schemas.makeAvailable),
  signOut: validate(schemas.signOut),
  updateRental: validate(schemas.updateRental),
  addProduct: validate(schemas.addProduct),
  updateVehicle: validate(schemas.updateVehicle),
  // Profile update validations
  updateProfile: validate(schemas.updateProfile),
  // Change password validations
  changePasswordStep1: validate(schemas.changePasswordStep1),
  changePasswordStep2: validate(schemas.changePasswordStep2),
  // Forgot Password validations
  verifyPhone: validate(schemas.verifyPhone),
  verifyOTP: validate(schemas.verifyOTP),
  updateUser: validate(schemas.updateUser),
  // Admin validations
  adminOTP: validate(schemas.adminOTP)
}; 