import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    local: {
      type: String,
      enum: ['Linha 1', 'Linha 2', 'Linha 3'],
      required: true,
    },
    ep: {
      type: Number,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    order: {
      total: {
        type: Number,
        required: true,
      },
      completed: {
        type: Number,
        required: true,
      },
      m2: {
        type: Number,
        required: true,
      },
    },
    butylLot: {
      type: String,
      required: false,
    },
    silicaLot: {
      type: String,
      required: false,
    },
    polysulfideLot: {
      white: {
        type: String,
        required: false,
      },
      black: {
        type: String,
        required: false,
      },
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrdersCollection = model('Order', orderSchema);
