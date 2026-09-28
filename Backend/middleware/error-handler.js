export function errorHandler(error, req, res, _next) {
  console.error(
    JSON.stringify({
      level: "error",
      event: "request.error",
      message: error?.message || "Unknown error",
      method: req.method,
      path: req.path || "/",
    }),
  );

  if (res.headersSent) return;

  let statusCode = error?.statusCode || error?.status || 500;
  let message = error?.message || "Request failed";

  if (error?.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(error.keyPattern || error.keyValue || {}).map(
      (field) =>
        ({
          usernameLower: "username",
          emailLower: "email",
          key_name: "key",
          tokenHash: "token",
        })[field] || field,
    );
    message = fields.length
      ? `A record with the same ${fields.join(", ")} already exists.`
      : "A record with the same unique value already exists.";
  } else if (error?.name === "ValidationError") {
    statusCode = 400;
    message =
      Object.values(error.errors || {})
        .map((item) => item.message)
        .join("; ") || "Request validation failed.";
  } else if (error?.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path || "request"} value.`;
  } else if (
    error?.name === "MongooseServerSelectionError" ||
    error?.name === "MongoNetworkError"
  ) {
    statusCode = 503;
    message = "Database service is unavailable.";
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  return res.status(statusCode).json({ success: false, message });
}

export default errorHandler;
