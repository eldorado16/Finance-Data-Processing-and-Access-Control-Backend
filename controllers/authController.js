const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const {
  getJwtSecret,
  getJwtSignOptions,
  getJwtVerifyOptions,
  extractBearerToken,
} = require("../utils/authToken");

const getTokenPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
});

const getSaltRounds = () => {
  const configured = Number(process.env.BCRYPT_SALT_ROUNDS);

  if (!Number.isFinite(configured)) {
    return 10;
  }

  return Math.min(Math.max(Math.trunc(configured), 8), 14);
};

const signToken = (user) => jwt.sign(getTokenPayload(user), getJwtSecret(), getJwtSignOptions());

const getAuthUserIfPresent = async (req) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Authentication failed");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "User account is inactive");
  }

  return user;
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = asyncHandler(async (req, res) => {
  const existingUsers = await User.countDocuments();

  if (existingUsers > 0) {
    const requester = await getAuthUserIfPresent(req);
    if (!requester || requester.role !== "admin") {
      throw new ApiError(403, "Only an admin can register new users");
    }
  }

  const alreadyExists = await User.findOne({ email: req.body.email });
  if (alreadyExists) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(req.body.password, getSaltRounds());

  const isBootstrapUser = existingUsers === 0;

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    role: isBootstrapUser ? "admin" : req.body.role || "viewer",
    status: isBootstrapUser ? "active" : req.body.status || "active",
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "User account is inactive");
  }

  const passwordMatches = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user);

  return res.json({
    message: "Login successful",
    token,
    user: sanitizeUser(user),
  });
});

module.exports = {
  register,
  login,
};