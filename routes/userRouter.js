

const Router = require('express');
const { getDashBoard } = require('../controllers/articleController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createUser, loginUser, 
       otpVerification, resendOtpCode,
       logoutUser 
    } = require('../controllers/authController');
const { validateSignup, validateLogin } = require("../middlewares/validateForm")
const resendOtpLimiter = require('../middlewares/rateLimit');
const router = Router();


router.post('/login', validateLogin, loginUser);
router.post('/signup', validateSignup, createUser);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtpLimiter, resendOtpCode);
router.post('/signup', createUser);
router.get('/dashboard', authMiddleware, isUser, getDashBoard);
router.get('/logout', authMiddleware, isUser, logoutUser);

module.exports = router;