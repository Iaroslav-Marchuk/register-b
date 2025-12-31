import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

import { UsersCollection } from '../db/models/userModel.js';
import { getEnvVariable } from '../utils/getEnvVariable.js';

export const registerUserService = async ({ name, email, password }) => {
  const user = await UsersCollection.findOne({ email: email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(password, 10);
  return await UsersCollection.create({
    name,
    email,
    password: encryptedPassword,
  });
};

export const loginUserService = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email: email });
  if (!user) throw createHttpError(401, 'Invalid email or password!');

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Invalid email or password!');
  }

  const secretKey = getEnvVariable('JWT_SECRET');

  const token = jwt.sign({ id: user._id }, secretKey, {
    expiresIn: '1h',
  });

  return {
    token,
    user: {
      userId: user._id,
      name: user.name,
    },
  };
};

export const getCurrentUserService = async (userId) => {
  const user = await UsersCollection.findById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  return {
    name: user.name,
    email: user.email,
  };
};
