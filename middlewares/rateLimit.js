const { TooManyRequestsError } = require('../utils/customError');
const rateLimit = require('express-rate-limit');


// Express rate limiter middleware
const resendOtpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 3,
    keyGenerator: (req) => {
      return  req.ip || ''; // Use user ID or IP address for rate limiting
    },
    handler: (req, res) => {
      throw new TooManyRequestsError('Too many OTP requests. Try again later.')
    },
  });

  module.exports = resendOtpLimiter ;