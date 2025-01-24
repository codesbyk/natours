const AppError = require('./../utils/appError');
const { BAD_REQUEST, INTERNAL_SERVER } = require('../utils/httpStatusCodes');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value ${err.keyValue.name}, Please use another value`;
  return new AppError(message, BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors).map((val) => val.message);
  return new AppError(message.join(', '), BAD_REQUEST);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(INTERNAL_SERVER).json({
      status: 'Error',
      message: 'Something went wrong. Internal error occurred',
    });
  }
};

module.exports = (err, req, res, next) => {
  let convertErrorObj = JSON.parse(JSON.stringify(err));
  let error = { ...convertErrorObj };
  error.statusCode = error.statusCode || INTERNAL_SERVER;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.errorResponse?.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
