const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  getJwtSecret,
  getJwtVerifyOptions,
  extractBearerToken,
} = require("../utils/authToken");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
  const user = await User.findById(payload.sub).select("-password");

  if (!user) {
    throw new ApiError(401, "Authentication failed");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "User account is inactive");
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;