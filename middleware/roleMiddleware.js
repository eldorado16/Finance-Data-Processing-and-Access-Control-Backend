const ApiError = require("../utils/ApiError");

const roleMiddleware = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }

  return next();
};

module.exports = roleMiddleware;