import Joi from 'joi';

export const createOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(20000).required(),
  client: Joi.string().required(),
  totalItems: Joi.number().integer().positive().min(1).required(),
  totalM2: Joi.number().positive().required(),
  completedItems: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(Joi.ref('totalItems'))
    .required(),
  completedM2: Joi.number().positive().max(Joi.ref('totalM2')).required(),

  butylLot: Joi.string().allow(''),
  silicaLot: Joi.string().allow(''),
  polysulfideLot: Joi.object({
    white: Joi.string().allow(''),
    black: Joi.string().allow(''),
  }),

  checkedNotes: Joi.array().items(Joi.string()).default([]),
});

export const createRecoveryOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(20000).required(),
  client: Joi.string(),

  totalItems: Joi.number().integer().positive().optional(),
  totalM2: Joi.number().positive().optional(),

  completedItems: Joi.number().integer().positive().min(1).required(),
  completedM2: Joi.number().positive().required(),

  butylLot: Joi.string().allow(''),
  silicaLot: Joi.string().allow(''),
  polysulfideLot: Joi.object({
    white: Joi.string().allow(''),
    black: Joi.string().allow(''),
  }),

  checkedNotes: Joi.array().items(Joi.string()).default([]),
});

export const updateOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(20000).required(),
  client: Joi.string(),
  totalItems: Joi.number().integer().positive().min(1),
  totalM2: Joi.number().positive(),
  completedItems: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(Joi.ref('totalItems'))
    .required(),
  completedM2: Joi.number().positive().max(Joi.ref('totalM2')).required(),

  butylLot: Joi.string().allow(''),
  silicaLot: Joi.string().allow(''),
  polysulfideLot: Joi.object({
    white: Joi.string().allow(''),
    black: Joi.string().allow(''),
  }),

  checkedNotes: Joi.array().items(Joi.string()).default([]),
});

export const editOrderSchema = Joi.object({
  ep: Joi.number().integer().positive().min(1).max(20000),
  client: Joi.string(),
  totalItems: Joi.number().integer().positive().min(1),
  totalM2: Joi.number().positive(),
  completedItems: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(Joi.ref('totalItems')),
  completedM2: Joi.number().positive().max(Joi.ref('totalM2')),

  butylLot: Joi.string().allow(''),
  silicaLot: Joi.string().allow(''),
  polysulfideLot: Joi.object({
    white: Joi.string().allow(''),
    black: Joi.string().allow(''),
  }),

  checkedNotes: Joi.array().items(Joi.string()).default([]),
});
