import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

import { UsersCollection } from '../db/models/userModel.js';
import { getEnvVariable } from '../utils/getEnvVariable.js';
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '../constants/constants.js';

const secretKey = getEnvVariable('JWT_SECRET');

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

export const loginUserService = async ({ email, password, local }) => {
  const user = await UsersCollection.findOne({ email: email });
  if (!user) throw createHttpError(401, 'Invalid email or password!');

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Invalid email or password!');
  }

  if (local) {
    user.local = local;
    await user.save();
  }

  const accessTokenValidUntil = ACCESS_TOKEN_EXP / 1000;
  const accessToken = jwt.sign({ userId: user._id }, secretKey, {
    expiresIn: accessTokenValidUntil,
  });

  const refreshTokenValidUntil = REFRESH_TOKEN_EXP / 1000;
  const refreshToken = jwt.sign({ userId: user._id }, secretKey, {
    expiresIn: refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      local: user.local,
    },
  };
};

export const refreshService = async (actualRefreshToken) => {
  if (!actualRefreshToken) throw createHttpError(401, 'No refresh token!');

  const decoded = jwt.verify(actualRefreshToken, secretKey);

  const user = await UsersCollection.findById(decoded.userId);
  if (!user) throw createHttpError(401, 'Not authorized');

  const newAccessToken = jwt.sign({ userId: user._id }, secretKey, {
    expiresIn: ACCESS_TOKEN_EXP,
  });

  return {
    accessToken: newAccessToken,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      local: user.local,
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
    local: user.local,
  };
};
