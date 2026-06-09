export const csrfMiddleware = (req, res, next) => {
  const publicEndpoints = ['/api/users/login', '/api/users/register', '/api/users/reset-password'];
  if (publicEndpoints.some(path => req.path.startsWith(path.replace('/api', '')))) {
    return next();
  }
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ success: false, message: 'CSRF validation failed' });
  }
  next();
};
