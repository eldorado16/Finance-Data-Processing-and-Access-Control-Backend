const express = require("express");
const { register, login } = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const { createRateLimiter } = require("../middleware/rateLimitMiddleware");
const { registerSchema, loginSchema } = require("../utils/validators");

const router = express.Router();

const toPositiveInt = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const authWindowMs = toPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const maxLoginAttempts = toPositiveInt(process.env.AUTH_LOGIN_MAX_ATTEMPTS, 10);
const maxRegisterAttempts = toPositiveInt(process.env.AUTH_REGISTER_MAX_ATTEMPTS, 10);

const loginRateLimiter = createRateLimiter({
  windowMs: authWindowMs,
  max: maxLoginAttempts,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: (req) => `login:${req.ip}:${(req.body?.email || "").toLowerCase()}`,
});

const registerRateLimiter = createRateLimiter({
  windowMs: authWindowMs,
  max: maxRegisterAttempts,
  message: "Too many registration attempts. Please try again later.",
  keyGenerator: (req) => `register:${req.ip}`,
});

router.post("/register", registerRateLimiter, validate(registerSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);

module.exports = router;