const ApiError = require("../utils/ApiError");

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return next(new ApiError(400, "Validation failed", details));
  }

  req[source] = result.data;
  return next();
};

module.exports = validate;