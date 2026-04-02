const ApiError = require("../utils/ApiError");

const createRateLimiter = ({
  windowMs,
  max,
  message,
  keyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown",
}) => {
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new Error("windowMs must be a positive number");
  }

  if (!Number.isFinite(max) || max <= 0) {
    throw new Error("max must be a positive number");
  }

  const store = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const record = store.get(key);

    if (!record || now >= record.resetAt) {
      store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      return next();
    }

    record.count += 1;

    const remaining = Math.max(max - record.count, 0);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));

      return next(
        new ApiError(429, message || "Too many requests, please try again later", {
          retryAfterSeconds,
        })
      );
    }

    if (store.size > 5000) {
      for (const [storedKey, storedValue] of store.entries()) {
        if (now >= storedValue.resetAt) {
          store.delete(storedKey);
        }
      }
    }

    return next();
  };
};

module.exports = {
  createRateLimiter,
};