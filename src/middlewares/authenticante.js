import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { getEnvVariable } from '../utils/getEnvVariable.js';
import { UsersCollection } from '../db/models/userModel.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }

  const token = authHeader.split(' ')[1];
  const secretKey = getEnvVariable('JWT_SECRET');
  const decoded = jwt.verify(token, secretKey);

  const user = await UsersCollection.findById(decoded.userId);

  if (!user) {
    next(createHttpError(401, 'User not found!'));
    return;
  }

  req.user = user;
  next();
};
