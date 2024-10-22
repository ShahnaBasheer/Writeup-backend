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
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

//Create new user from signup form
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed");
  }

  const user = await User.findOne({ email });

  if (user) {
    if (!user.isVerified) await User.deleteOne({ email });
    else {
      throw new ConflictError("You have already signed up. Please log in!");
    }
  }
  await otpEmailSend(req, true, email);
  createSuccessResponse(
    200,
    { email },
    "Verification Code has been sent Successfully!",
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
    createSuccessResponse(
      200,
      { email, remainingLimit },
      "OTP resent successfully",
      res
    );
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
  const timeDifferenceInMinutes =
    (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
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

  if (findUser && findUser?.isBlocked) {
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
      httpOnly: true, // Cookie is not accessible via client-side scripts
      secure: process.env.NODE_ENV === 'production', // Cookie will be sent only over HTTPS
      sameSite: 'Lax', // Required for cross-site requests
      maxAge: 3 * 24 * 60 * 60 * 1000, // Cookie expires after 3 days
    });
    createSuccessResponse(
      200,
      { token: accessToken, user: findUser },
      "Login successfully!",
      res
    );
  } else {
    throw new UnauthorizedError("Invalid email or password");
  }
});

// //logout user
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req?.cookies[process.env.USER_REFRESH];
  if (!refreshToken) throw new Error("No Refresh Token in Cookies");
  res.clearCookie(process.env.USER_REFRESH, {
    httpOnly: true, // Match these settings with the original cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax'
  });
  
  createSuccessResponse(200, null, "Successfully Logout!", res, req);
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await User.findOne({ _id: req.user?.id });

  if (!profile) {
    createSuccessResponse(404, "Profile not found", res, req);
  }
  createSuccessResponse(
    200,
    { profile },
    "Successfully retrieved Profile!",
    res,
    req
  );
});

const editProfile = asyncHandler(async (req, res) => {
  const { fullName, work, interests } = req.body; // Assuming these fields are allowed for updates
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new BadRequestError("Validation failed");
  }

  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (work) updateData.work = work;
  if (interests) updateData.interests = interests;

  const profile = await User.findOneAndUpdate(
    { _id: req.user?.id },
    { $set: updateData },
    { new: true, runValidators: true } // return the updated document and run validation
  );

  if (!profile) {
    createSuccessResponse(404, null, "Profile not found!", res, req);
  }

  createSuccessResponse(
    200,
    { profile },
    "Successfully edited Profile!",
    res,
    req
  );
});

const passWordChangeProfile = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError("Credentials are required!");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new BadRequestError("Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    createSuccessResponse(
      200,
      null,
      "Password has been changed successfully!",
      res,
      req
    );
  } catch (error) {
    console.error("Error changing password:", error.message);
    if (error instanceof BadRequestError) {
      throw error; // rethrow known errors
    } else {
      throw new BadRequestError("Failed to change password. Please try again.");
    }
  }
});

const emailChangeProfile = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const existingVendor = await User.findOne({ email });
    if (existingVendor) {
      throw new ConflictError("Email already in use");
    }
    
    const oldEmailOtp = await otpEmailSend(req, false ,req.user?.email);
    const newEmailOtp = await otpEmailSend(req, false , email);

    const profile = await User.findOneAndUpdate(
      { _id: req.user?.id },
      {
        otp: oldEmailOtp,
        otpTimestamp: new Date(),
        newotp: newEmailOtp,
        newotpTimestamp: new Date(),
      }, { new: true }
    );
    req.user = profile;
    createSuccessResponse(
      200,
      { profile, email },
      "OTP has been sent successfully to both emails!",
      res,
      req
    );
  } catch (error) {
    console.error("Error changing Email:", error.message);
    if (error instanceof BadRequestError) {
      throw error;
    } else {
      throw new BadRequestError("Failed to change email. Please try again.");
    }
  }
});


const verifyOTP = asyncHandler(async (req, res) => {
  const user = req.user;
  const { otpOld, otpNew, email } = req.body;
  try {
    const currentTime = new Date();

    // Validate old OTP
    if (!user?.otp || !user?.otpTimestamp || user?.otp !== otpOld) {
      throw new BadRequestError(`Invalid OTP for ${user.email}`);
    }

    // Check if old OTP is expired
    const otpTimestamp = new Date(user?.otpTimestamp);
    const oldtimeDifferenceInMinutes =
      (currentTime.getTime() - otpTimestamp.getTime()) / (1000 * 60);
    if (oldtimeDifferenceInMinutes > 2) {
      throw new BadRequestError(`OTP is Expired for ${user.email}`);
    }

    // Validate new OTP
    if (
      !user?.newotp ||
      !user?.newotpTimestamp ||
      user?.newotp !== otpNew
    ) {
      throw new BadRequestError(`Invalid OTP for ${email}`);
    }

    // Check if new OTP is expired
    const newotpTimestamp = new Date(user?.newotpTimestamp);
    const newtimeDifferenceInMinutes =
      (currentTime.getTime() - newotpTimestamp.getTime()) / (1000 * 60);
    if (newtimeDifferenceInMinutes > 3) {
      throw new BadRequestError(`OTP is Expired for ${email}`);
    }

    // Update user in the database
    const profile = await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: { email },
        $unset: { otpTimestamp: "", otp: "", newotpTimestamp: "", newotp: "" },
      }, { new: true }
    );
    createSuccessResponse(
      200,
      { profile },
      "Your email has been successfull changed!",
      res,
      req
    );
  } catch (error) {
    console.error("Error during OTP verification for email change:", error);
    throw error;
  }
});


module.exports = {
  createUser,
  loginUser,
  resendOtpCode,
  otpVerification,
  logoutUser,
  getProfile,
  editProfile,
  passWordChangeProfile,
  emailChangeProfile,
  verifyOTP,
  // updateUser,
  // getUser,
  // restoreUser,
  // deleteUser,
  // blockUser,
  // unblockUser,
  // emailCheck,
};
