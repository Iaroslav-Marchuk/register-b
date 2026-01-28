import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    ep: {
      type: Number,
      required: true,
      index: true,
    },

    client: {
      type: String,
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
    },
    totalM2: {
      type: Number,
      required: true,
    },

    completedItems: {
      type: Number,
      required: true,
    },
    completedM2: {
      type: Number,
      required: true,
    },

    missedItems: {
      type: Number,
      required: false,
    },
    missedM2: {
      type: Number,
      required: false,
    },

    type: {
      type: String,
      enum: ['created', 'continued', 'recovered'],
      default: 'created',
    },

    isFinal: {
      type: Boolean,
      default: false,
    },

    local: {
      type: String,
      enum: ['Linha 1', 'Linha 2', 'Linha 3'],
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
