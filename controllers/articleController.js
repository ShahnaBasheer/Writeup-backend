const asyncHandler = require("express-async-handler");
const createSuccessResponse = require("../utils/responseFormatter");
const { CloudinaryfileStore } = require("../utils/helperFunction");
const { validationResult } = require('express-validator');
const Article = require("../models/ArticleModel");
const { BadRequestError, ConflictError } = require("../utils/customError");



const getDashBoard = asyncHandler(async (req, res) => {
  const articles = await Article.find({}).populate('author');
  createSuccessResponse(200, { articles }, "successfully", res, req);
});


const createArticle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  // Validate incoming request data
  if (!errors.isEmpty()) {
    console.log(errors.array());
    throw new BadRequestError("Validation failed");
  }

  // Ensure an image file is uploaded
  if (!req.files?.image) {
    throw new ConflictError('Image is required');
  }

  // Upload the image to Cloudinary (or relevant storage)
  const coverPicPath = await CloudinaryfileStore(req.files.image, "/Articles/CoverPics", "AR_coverpic");

  if (!coverPicPath || coverPicPath.length === 0) {
    throw new Error("Image upload failed");
  }

  // Prepare article data to be saved
  const data = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    description: req.body.description,
    author: req.user.id,  // assuming req.user.id is set by an authentication middleware
    image: coverPicPath[0]  // store the first URL/path from the array
  };

  // Save article to database
  await Article.create(data);

  // Send success response
  createSuccessResponse(200, null, "Article created successfully", res, req);
});


const getMyArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ author: req?.user?.id });
  createSuccessResponse(200, { articles }, "Articles retrieved successfully", res, req);
});

const getArticleDetail = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findById(articleId).populate('author');
  createSuccessResponse(200, { article }, "Article retrieved successfully", res, req);
});

const editArticle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  let coverPicPath = null;

  // Validate incoming request data
  if (!errors.isEmpty()) {
    console.log(errors.array());
    throw new BadRequestError("Validation failed");
  }

  if (!req.body.articleId) {
    throw new BadRequestError("Article ID is required");
  }

  // Find the existing article by ID
  const existingArticle = await Article.findById(req.body.articleId);
  if (!existingArticle) {
    throw new NotFoundError("Article not found");
  }

  // Ensure an image file is uploaded
  if (req.files?.image) {
    coverPicPath = await CloudinaryfileStore(req.files.image, "/Articles/CoverPics", "AR_coverpic");

    if (!coverPicPath || coverPicPath.length === 0) {
      throw new Error("Image upload failed");
    }
    existingArticle.image = coverPicPath[0]; 
  }

  // Update the article fields with the new data from the request
  existingArticle.title = req.body.title || existingArticle.title;
  existingArticle.content = req.body.content || existingArticle.content;
  existingArticle.category = req.body.category || existingArticle.category;
  existingArticle.description = req.body.description || existingArticle.description;

  // Save the updated article back to the database
  await existingArticle.save();

  // Send success response
  createSuccessResponse(200, null, "Article updated successfully", res, req);
});

const deleteArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findById(articleId);
  
  if (!article) {
    throw new Error("Article not found"); 
  }

  await Article.findByIdAndDelete(articleId);
  createSuccessResponse(200, null, "Article successfully deleted", res, req);
});


module.exports = {
  getDashBoard,
  createArticle,
  getMyArticles,
  getArticleDetail,
  editArticle,
  deleteArticle
};
