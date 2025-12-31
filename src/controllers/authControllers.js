import {
  getCurrentUserService,
  loginUserService,
  registerUserService,
} from '../services/authServices.js';

export const registerUserController = async (req, res) => {
  const user = await registerUserService(req.body);

  res.status(201).json({
    status: 201,
    message: 'New user registered successfully!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const result = await loginUserService(req.body);

  res.status(200).json({
    status: 200,
    message: 'User is successfully logged!',
    data: result,
  });
};

export const getCurrentUserController = async (req, res) => {
  const currentUser = await getCurrentUserService(req.user._id);

  res.status(200).json({
    status: 200,
    message: 'Current user finded!',
    data: currentUser,
  });
};
