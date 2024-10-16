const { body } = require("express-validator");

const validateSignup = [
  // Validation rules for each field in the request body
  body("fullName")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Full Name is required"),
  body("work").notEmpty().isLength({ min: 3 }).withMessage("Work is required"),
  body("email").isEmail().withMessage("Email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain atlease 6 characters"),
];

const validateArticleForm = [
  // Validation for the title field
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  // Validation for the category field
  body("category")
    .isString()
    .withMessage("Category must be a string")
    .isLength({ min: 3 })
    .withMessage("Category must be at least 3 characters long"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 100 })
    .withMessage("Description must be at least 100 characters long")
    .isLength({ max: 400 })
    .withMessage("Description must be at atmost 400 characters long"),
  // Validation for the content field
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .isLength({ min: 200 })
    .withMessage("Content must be at least 200 characters long"),
];

const validateLogin = [
  // Validation rules for each field in the request body
  body("email").isEmail().withMessage("Email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain atlease 6 characters"),
];

module.exports = {
  validateSignup,
  validateLogin,
  validateArticleForm,
};
