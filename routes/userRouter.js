

const Router = require('express');
const { getDashBoard, createArticle,
    getMyArticles, getArticleDetail,
    editArticle, deleteArticle
 } = require('../controllers/articleController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createUser, loginUser, 
       otpVerification, resendOtpCode,
       logoutUser, getProfile,
       editProfile, passWordChangeProfile,
       emailChangeProfile, verifyOTP
    } = require('../controllers/authController');
const { validateSignup, validateLogin, validateArticleForm, validateProfile, validatePassword } = require("../middlewares/validateForm")
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
router.get('/myarticles', getMyArticles); // Get user's articles
router.get('/details/:articleId', getArticleDetail); // Get article details

// Article routes
router.route('/article')
  .post(upload, validateArticleForm, createArticle) // Create article
  .patch(upload, validateArticleForm, editArticle); // Update article

router.route('/article/:articleId')
  .get(getArticleDetail) // Get article details
  .delete(deleteArticle); // Delete article


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





// router.get('/', authMiddleware, isUser, getDashBoard);
// router.post('/login', validateLogin, loginUser);
// router.post('/signup', validateSignup, createUser);
// router.post('/verify-otp', otpVerification);
// router.post('/resend-otp', resendOtpLimiter, resendOtpCode);
// router.post('/signup', createUser);
// router.get('/dashboard', authMiddleware, isUser, getDashBoard);
// router.get('/myarticles', authMiddleware, isUser, getMyArticles);
// router.get('/details/:articleId', authMiddleware, isUser, getArticleDetail);
// router.post('/logout', authMiddleware, isUser, logoutUser);
// router.post('/article/create', authMiddleware, isUser, upload, validateArticleForm, createArticle);
// router.patch('/article/update', authMiddleware, isUser, upload, validateArticleForm, editArticle);
// router.delete('/article/delete/:articleId', authMiddleware, isUser, deleteArticle);
// router.get('/profile', authMiddleware, isUser, getProfile);
// router.put('/profile/edit', authMiddleware, isUser, validateProfile ,editProfile);
// router.patch('/profile/change-password', authMiddleware, isUser, validatePassword, passWordChangeProfile);
// router.patch('/profile/change-email', authMiddleware, isUser, emailChangeProfile);
// router.patch('/profile/verify-otp', authMiddleware, isUser, verifyOTP);