import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  if (err instanceof HttpError) {
    res.status(err.status).json({
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    message: 'Something went wrong',
  });
};
