const ApiError = require("../utils/ApiError");

const includeStack = process.env.ERROR_INCLUDE_STACK === "true";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Internal server error";
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    details = err.issues?.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for ${Object.keys(err.keyValue).join(", ")}`;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  const payload = { message };

  if (details) {
    payload.details = details;
  }

  if (includeStack) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

module.exports = errorHandler;