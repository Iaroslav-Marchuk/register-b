import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '../constants/constants.js';
import {
  getCurrentUserService,
  loginUserService,
  refreshService,
  registerUserService,
} from '../services/authServices.js';

export const registerUserController = async (req, res) => {
  await registerUserService(req.body);

  res.status(201).json({
    message: 'New user registered successfully!',
  });
};

export const loginUserController = async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUserService(req.body);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: 'None',
    secure: true,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_EXP,
    sameSite: 'None',
    secure: true,
    path: '/',
  });

  res.status(200).json({
    user,
    message: 'User is successfully logged!',
  });
};

export const logoutController = async (req, res) => {
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken')
    .status(200)
    .json({ message: 'Logged out successfully' });
};

export const refreshController = async (req, res) => {
  const { accessToken, user } = await refreshService(req.body);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: 'None',
    secure: true,
    path: '/',
  });

  res.status(200).json({
    user,
    message: 'User is successfully logged!',
  });
};

export const getCurrentUserController = async (req, res) => {
  const currentUser = await getCurrentUserService(req.user._id);
  res.status(200).json({
    message: 'Current user finded!',
    currentUser,
  });
};
