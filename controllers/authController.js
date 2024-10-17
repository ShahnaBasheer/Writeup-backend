const User = require("../models/userModel");
const { generateToken, generateRefreshToken } = require("../config/jwtToken");
const asyncHandler = require("express-async-handler");
const {
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} = require("../utils/customError");
const createSuccessResponse = require("../utils/responseFormatter");
const { otpEmailSend } = require("../utils/helperFunction");
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/sendEmail');


//Create new user from signup form
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed");
  }

  const user = await User.find({ email });

  if (user) {
    if (!user.isVerified) await User.deleteOne({ email });
    else {
      throw new ConflictError("You have already signed up. Please log in!");
    }
  }
  await otpEmailSend(req, true);
  createSuccessResponse(
    200,
    { email }, "Verification Code has been sent Successfully!",
    res,
    req
  );
});


const resendOtpCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const remainingLimit = res.getHeader("X-RateLimit-Remaining");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed");
  }

  const user = await User.findOne({ email });

  if (user && !user.isVerified) {
    await otpEmailSend(req, false, email);
    createSuccessResponse(200,{ email, remainingLimit }, "OTP resent successfully", res);
  } else {
    throw new NotFoundError("User not found or already verified");
  }
});

// //OTP verification
const otpVerification = asyncHandler(async (req, res) => {
  const { otp, email } = req?.body,
    user = await User.findOne({ email });

  if (user && user?.isVerified) throw new ConflictError("User Already Exist!");
 
  if (!user?.otp || !user?.otpTimestamp || user?.otp !== otp) {
    throw new BadRequestError("Invalid OTP");
  }

  const currentTime = new Date();
  const otpTimestamp = new Date(user?.otpTimestamp);
  const timeDifferenceInMinutes = (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
  console.log(timeDifferenceInMinutes > 2)
  if (timeDifferenceInMinutes > 2) throw new BadRequestError("Expired OTP"); // OTP expired

  // OTP is valid within the 10-minute window
  const subject = "Welcome to WriteUp";
  const text = `Dear ${user.fullName},\n
                    Welcome to WriteUp!\n We are thrilled to have you on board.Thank you for choosing us`;

  await sendEmail(email, subject, text);
  await User.updateOne(
    { email },
    {
      $set: { isVerified: true }, // Set fields you want to keep
      $unset: { otpTimestamp: "", otp: "" }, // Unset fields you want to remove
    }
  );

  createSuccessResponse(
    200,
    null,
    "You have successfully signed up! Please Login here",
    res
  );
});

// //login user from login form
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed");
  }

  const findUser = await User.findOne({ email, isDeleted: false });

  if (findUser && findUser?.isBlocked){
    throw new ForbiddenError("User account is blocked");
  }

  if (
    findUser &&
    (await findUser?.comparePassword(password)) &&
    findUser?.role == "user" &&
    findUser?.isVerified
  ) {
    const accessToken = generateToken(findUser?.id);
    const refreshToken = generateRefreshToken(findUser?.id);

    res.cookie(process.env.USER_REFRESH, refreshToken, {
      httpOnly: true,
      secure: true,
      SameSite: 'Lax',
      maxAge: 3 * 24 * 60 * 60 * 1000, //3 * 24 * 60 * 60 * 1000
    });
    createSuccessResponse(200, { token: accessToken, user: findUser }, "Login successfully!", res);
  } else {
    throw new UnauthorizedError("Invalid email or password");
  }
});



// //logout user
const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req?.cookies[process.env.USER_REFRESH];
    console.log('Refresh Cookie Name:', process.env.USER_REFRESH);
    if (!refreshToken) throw new Error("No Refresh Token in Cookies");
    res.clearCookie(process.env.USER_REFRESH);
    createSuccessResponse(200, null, "Successfully Logout!", res, req)
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await User.findOne({ _id: req.user.id });
  createSuccessResponse(200, { profile }, "Successfully get Profile!", res, req)
});



module.exports = {
  createUser,
  loginUser,
  resendOtpCode,
  otpVerification,
  logoutUser,
  getProfile
  // updateUser,
  // getUser,
  // restoreUser,
  // deleteUser,
  // blockUser,
  // unblockUser,
  // emailCheck,
};
