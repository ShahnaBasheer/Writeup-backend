const { body } = require('express-validator');


const validateSignup = [
    // Validation rules for each field in the request body
    body('fullName').notEmpty().isLength({ min: 3 }).withMessage('Full Name is required'),
    body('work').notEmpty().isLength({ min: 3 }).withMessage('Work is required'),
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
  ];
  
  const validateLogin = [
    // Validation rules for each field in the request body
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must contain atlease 6 characters'),
  ];
  
module.exports = {
    validateSignup,
    validateLogin
}  