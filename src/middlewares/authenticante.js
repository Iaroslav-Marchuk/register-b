import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { getEnvVariable } from '../utils/getEnvVariable.js';
import { UsersCollection } from '../db/models/userModel.js';

export const authenticate = async (req, res, next) => {
  const actualAccessToken = req.cookies.accessToken;

  if (!actualAccessToken) {
    return next(createHttpError(401, 'Not authorized'));
  }

  try {
    const secretKey = getEnvVariable('JWT_SECRET');
    const decoded = jwt.verify(actualAccessToken, secretKey);
    const user = await UsersCollection.findById(decoded.userId);

    if (!user) {
      return next(createHttpError(401, 'User not found!'));
    }

    // req.user = { ...user, local: decoded.local };

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      local: decoded.local,
    };
    next();
  } catch (error) {
    next(error);
  }
};
