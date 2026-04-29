import { verifyAccess } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncWrapper } from '../utils/asyncWrapper.js';

export const protect = asyncWrapper(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new ApiError(401, 'No token provided');
  const token = auth.split(' ')[1];
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    throw new ApiError(401, 'Token invalid or expired');
  }
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return next(new ApiError(403, 'Insufficient permissions'));
  next();
};
