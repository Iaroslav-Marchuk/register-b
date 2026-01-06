import Joi from 'joi';

export const createOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(15000).required(),
  client: Joi.string().required(),
  order: Joi.object({
    total: Joi.number().integer().positive().min(1).required(),
    // completed: Joi.number().integer().min(0).max(Joi.ref('total')).required(),
    completed: Joi.number().integer().min(0).required(),
    m2: Joi.number().positive().required(),
  }).required(),

  butylLot: Joi.string().allow(''),
  silicaLot: Joi.string().allow(''),
  polysulfideLot: Joi.object({
    white: Joi.string().allow(''),
    black: Joi.string().allow(''),
  }),
  notes: Joi.string().min(1).max(40).allow(''),
});

export const updateOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(15000),
  client: Joi.string(),
  order: Joi.object({
    total: Joi.number().integer().positive().min(1),
    completed: Joi.number().integer().positive().min(1),
    m2: Joi.number().positive(),
  }),

  butylLot: Joi.string(),
  silicaLot: Joi.string(),
  polysulfideLot: {
    white: Joi.string(),
    black: Joi.string(),
  },
  notes: Joi.string().min(1).max(40),
}).min(1);
