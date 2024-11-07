

const Router = require('express');
const { getDashBoard, createBlog,
    getMyBlogs, getBlogDetail,
    editBlog, deleteBlog
 } = require('../controllers/BlogController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createUser, loginUser, 
       otpVerification, resendOtpCode,
       logoutUser, getProfile,
       editProfile, passWordChangeProfile,
       emailChangeProfile, verifyOTP
    } = require('../controllers/authController');
const { validateSignup, validateLogin, validateBlogForm, validateProfile, validatePassword } = require("../middlewares/validateForm")
const resendOtpLimiter = require('../middlewares/rateLimit');
const upload = require('../config/multer');
const router = Router();



// Public routes (no authentication required)
router.post('/login', validateLogin, loginUser);
router.post('/signup', validateSignup, createUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtpLimiter, resendOtpCode);

// Authenticated routes (all routes here require authMiddleware and isUser)
router.use(authMiddleware, isUser);


router.get('/dashboard', getDashBoard);
router.get('/myblogs', getMyBlogs); // Get user's Blogs
router.get('/details/:blogId', getBlogDetail); // Get Blog details

// Blog routes
router.route('/blog')
  .post(upload, validateBlogForm, createBlog) // Create Blog
  .patch(upload, validateBlogForm, editBlog); // Update Blog

router.route('/blog/:blogId')
  .get(getBlogDetail) // Get Blog details
  .delete(deleteBlog); // Delete Blog


// Profile routes
router.route('/profile')
  .get(getProfile) // Get profile
  .put(validateProfile, editProfile); // Edit profile

router.route('/profile/change-password')
  .patch(validatePassword, passWordChangeProfile); // Change password

router.route('/profile/change-email')
  .patch(emailChangeProfile); // Change email

router.route('/profile/verify-otp')
  .patch(verifyOTP); // Verify OTP

// Logout route
router.post('/logout', logoutUser);


module.exports = router;


