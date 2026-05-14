import logger from '../services/loggerService.js';

const errorHandler = (err, req, res, next) => {
  const extra = {
    statusCode: err.statusCode || 500,
    method: req.method,
    url: req.originalUrl,
    user_uuid: req.user?.uuid
  };

  if (err.name !== 'CustomError') {
    extra.stack = err.stack;
  }

  logger.log({
    action: null,
    log_type: 'system',
    details: err.message,
    extra_data: extra,
    log_level: 'error'
  });

  res.status(extra.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
