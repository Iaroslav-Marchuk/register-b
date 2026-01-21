import createHttpError from 'http-errors';

export const validateNumbers = (req, res, next) => {
  const order = req.body.order;

  if (!order) return next();

  const { total, completed } = order;

  if (total === undefined || completed === undefined) {
    return next();
  }

  if (completed > total) {
    return next(createHttpError(400, 'Completed can’t be more than total'));
  }

  next();
};
