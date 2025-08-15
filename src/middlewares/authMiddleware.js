import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();

/* 
Middleware to authenticate requests using JWT
Expects the token to be in the Authorization header in the format. the token includes data about the user 
verify the token and attach the user data to the request object
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
