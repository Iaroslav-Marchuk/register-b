import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '../constants/constants.js';
import {
  changeLocalService,
  changePasswordService,
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
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
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
  const actualRefreshToken = req.cookies.refreshToken;
  const { accessToken, user } = await refreshService(actualRefreshToken);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.status(200).json({
    user,
    message: 'User is successfully logged!',
  });
};

export const getCurrentUserController = async (req, res) => {
  const { userId, local } = req.user;
  const user = await getCurrentUserService(userId, local);

  res.status(200).json({
    message: 'Current user finded!',
    user,
  });
};

export const changelocalController = async (req, res) => {
  const { local } = req.body;
  const userId = req.user._id;

  const { accessToken, refreshToken, user } = await changeLocalService(
    userId,
    local,
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.status(200).json({
    user,
    message: 'Local is successfully changed!',
  });
};

export const changePasswordController = async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;
  const local = req.user.local;

  const { accessToken, refreshToken, user } = await changePasswordService(
    userId,
    oldPassword,
    newPassword,
    local,
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_EXP,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.status(200).json({
    user,
    message: 'Password is successfully changed!',
  });
};
