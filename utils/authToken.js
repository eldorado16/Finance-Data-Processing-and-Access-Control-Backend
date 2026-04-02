const ApiError = require("./ApiError");

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  if (secret.length < 32) {
    throw new ApiError(500, "JWT secret must be at least 32 characters");
  }

  return secret;
};

const getJwtSignOptions = () => {
  const options = {
    algorithm: JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  };

  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER;
  }

  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE;
  }

  return options;
};

const getJwtVerifyOptions = () => {
  const options = {
    algorithms: [JWT_ALGORITHM],
  };

  if (process.env.JWT_ISSUER) {
    options.issuer = process.env.JWT_ISSUER;
  }

  if (process.env.JWT_AUDIENCE) {
    options.audience = process.env.JWT_AUDIENCE;
  }

  return options;
};

const extractBearerToken = (authHeader = "") => {
  if (typeof authHeader !== "string") {
    return null;
  }

  const trimmed = authHeader.trim();
  if (!trimmed) {
    return null;
  }

  const [scheme, token, ...rest] = trimmed.split(/\s+/);

  if (scheme !== "Bearer" || !token || rest.length > 0) {
    return null;
  }

  return token;
};

module.exports = {
  getJwtSecret,
  getJwtSignOptions,
  getJwtVerifyOptions,
  extractBearerToken,
};