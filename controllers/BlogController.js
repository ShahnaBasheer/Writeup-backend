const asyncHandler = require("express-async-handler");
const createSuccessResponse = require("../utils/responseFormatter");
const { CloudinaryfileStore } = require("../utils/helperFunction");
const { validationResult } = require('express-validator');
const Blog = require("../models/BlogModel");
const { BadRequestError, ConflictError } = require("../utils/customError");



const getDashBoard = asyncHandler(async (req, res) => {
  const interests = req?.user?.interests ;
  let filter = {};
  if (interests?.length > 0) {
    filter = { category: { $in: interests } }; // Filter by interests if not empty
  }

  const blogs = await Blog.find(filter).populate('author').sort({ createdAt: -1 });;
  createSuccessResponse(200, { blogs }, "successfully fetch dashboard data", res, req);
});


const createBlog = asyncHandler(async (req, res) => {
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
  const coverPicPath = await CloudinaryfileStore(req.files.image, "/Blogs/CoverPics", "AR_coverpic");

  if (!coverPicPath || coverPicPath.length === 0) {
    throw new Error("Image upload failed");
  }

  // Prepare Blog data to be saved
  const data = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    description: req.body.description,
    author: req.user.id,  // assuming req.user.id is set by an authentication middleware
    image: coverPicPath[0]  // store the first URL/path from the array
  };

  // Save Blog to database
  const blog = await Blog.create(data);
  createSuccessResponse(200, { blog }, "Blog created successfully", res, req);
});


const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ author: req?.user?.id }).sort({ createdAt: -1 });;
  createSuccessResponse(200, { blogs }, "Blogs retrieved successfully", res, req);
});

const getBlogDetail = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId).populate('author');
  createSuccessResponse(200, { blog }, "Blog retrieved successfully", res, req);
});

const editBlog = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  let coverPicPath = null;

  // Validate incoming request data
  if (!errors.isEmpty()) {
    console.log(errors.array());
    throw new BadRequestError("Validation failed");
  }

  if (!req.body.blogId) {
    throw new BadRequestError("Blog ID is required");
  }

  // Find the existing Blog by ID
  const existingBlog = await Blog.findById(req.body.blogId);
  if (!existingBlog) {
    throw new NotFoundError("Blog not found");
  }

  // Ensure an image file is uploaded
  if (req.files?.image) {
    coverPicPath = await CloudinaryfileStore(req.files.image, "/Blogs/CoverPics", "Blog_coverpic");

    if (!coverPicPath || coverPicPath.length === 0) {
      throw new Error("Image upload failed");
    }
    existingBlog.image = coverPicPath[0]; 
  }

  // Update the Blog fields with the new data from the request
  existingBlog.title = req.body.title || existingBlog.title;
  existingBlog.content = req.body.content || existingBlog.content;
  existingBlog.category = req.body.category || existingBlog.category;
  existingBlog.description = req.body.description || existingBlog.description;

  // Save the updated Blog back to the database
  const blog = await existingBlog.save();

  // Send success response
  createSuccessResponse(200, { blog }, "Blog updated successfully", res, req);
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const getBlog = await Blog.findById(blogId);
  
  if (!getBlog) {
    throw new Error("Blog not found"); 
  }

  const blog = await Blog.findByIdAndDelete(blogId);
  createSuccessResponse(200,{ blog }, "Blog successfully deleted", res, req);
});


module.exports = {
  getDashBoard,
  createBlog,
  getMyBlogs,
  getBlogDetail,
  editBlog,
  deleteBlog
};
