const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const { ForbiddenError, UnauthorizedError } = require("../utils/customError");
const { generateToken } = require("../config/jwtToken");



const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const authorizationHeader = req.headers?.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Not authorized: no Bearer");
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      throw new UnauthorizedError("Not authorized: no access token");
    }

    const decode = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decode?.id);

    if (!user) throw new UnauthorizedError("User not found!");

    if (user.isBlocked) {
      res.clearCookie(process.env.USER_REFRESH, {
        httpOnly: true, // Match these settings with the original cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production'? 'None': 'Lax',
      });
      throw new ForbiddenError("User account is blocked");
    }

    req.user = user;
    return next();
  } catch (error) {
    console.log(error.message, "line 75 authmiddleware");
    if (error instanceof jwt.TokenExpiredError) {
      let refreshToken = req?.cookies[process.env.USER_REFRESH];

      if (!refreshToken) {
        throw new UnauthorizedError(`Refreshtoken is not found!`);
      }

      try {
        const decode = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decode?.id);
        if (!user) throw new UnauthorizedError("User not found!");

        if (user.isBlocked) {
          throw new ForbiddenError("User account is blocked");
        }

        const token = generateToken(user?.id);
        console.log("new token has been generated and stored");
        req.user = user;
        req.token = token;
      } catch (error) {
        res.clearCookie(process.env.USER_REFRESH, {
          httpOnly: true, // Match these settings with the original cookie
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production'? 'None': 'Lax',
        });
        if (
          error instanceof ForbiddenError ||
          error instanceof UnauthorizedError
        ) {
          throw error;
        }
        console.log(error?.message, "session expired");
      }
    } else if (error instanceof ForbiddenError) {
      throw error;
    }
     
    return next();
  }
});

// Check ifCustomer is authorized
const isUser = asyncHandler(async (req, res, next) => {
  if (req?.user) {
    return next();
  }
  throw new UnauthorizedError("Authorization Failed!");
});

module.exports = { authMiddleware, isUser }
