import AppError from "../utils/AppError.js";

const sendErrorDev = (err, res) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    data: null,
    error: {
      code: err.errorCode || "INTERNAL_SERVER_ERROR",
      stack: err.stack,
    },
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      error: {
        code: err.errorCode,
      },
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
};

const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue || {})[0];

  return new AppError(
    `${field || "Field"} already exists`,
    409,
    "DUPLICATE_FIELD"
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((item) => item.message);

  return new AppError(messages.join(", "), 400, "VALIDATION_ERROR");
};

const handleCastError = () => {
  return new AppError("Invalid resource id", 400, "INVALID_ID");
};

const handleJWTError = () => {
  return new AppError("Invalid token", 401, "INVALID_TOKEN");
};

const handleJWTExpiredError = () => {
  return new AppError("Token expired, please login again", 401, "TOKEN_EXPIRED");
};

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  error.statusCode = error.statusCode || 500;
  error.errorCode = error.errorCode || "INTERNAL_SERVER_ERROR";

  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.name === "CastError") error = handleCastError(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError(error);
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError(error);

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(error, res);
  }

  return sendErrorProd(error, res);
};

export default errorMiddleware;