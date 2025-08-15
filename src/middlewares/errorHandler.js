const errorHandler = (err, req, res, next) => {
  if (err.name === 'CustomError') {
    console.error(`ERROR: ${err.statusCode} - ${err.message}`);
  } else {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
