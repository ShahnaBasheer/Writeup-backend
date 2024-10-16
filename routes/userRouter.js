

const Router = require('express');
const { getDashBoard, createArticle,
    getMyArticles, getArticleDetail,
    editArticle, deleteArticle
 } = require('../controllers/articleController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createUser, loginUser, 
       otpVerification, resendOtpCode,
       logoutUser, getProfile
    } = require('../controllers/authController');
const { validateSignup, validateLogin, validateArticleForm } = require("../middlewares/validateForm")
const resendOtpLimiter = require('../middlewares/rateLimit');
const upload = require('../config/multer');
const router = Router();


router.post('/login', validateLogin, loginUser);
router.post('/signup', validateSignup, createUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtpLimiter, resendOtpCode);
router.post('/signup', createUser);
router.get('/dashboard', authMiddleware, isUser, getDashBoard);
router.get('/myarticles', authMiddleware, isUser, getMyArticles);
router.get('/details/:articleId', authMiddleware, isUser, getArticleDetail);
router.get('/profile', authMiddleware, isUser, getProfile);
router.get('/logout', authMiddleware, isUser, logoutUser);
router.post('/create/article', authMiddleware, isUser, upload, validateArticleForm, createArticle);
router.patch('/update/article', authMiddleware, isUser, upload, validateArticleForm, editArticle);
router.delete('/delete/article/:articleId', authMiddleware, isUser, deleteArticle);




module.exports = router;