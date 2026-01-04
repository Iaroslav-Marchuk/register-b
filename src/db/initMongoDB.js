import mongoose from 'mongoose';

import { getEnvVariable } from '../utils/getEnvVariable.js';

export const initMongoDB = async () => {
  try {
    const user = getEnvVariable('MONGODB_USER');
    const password = getEnvVariable('MONGODB_PASSWORD');
    const url = getEnvVariable('MONGODB_URL');
    const db = getEnvVariable('MONGODB_DB');

    await mongoose.connect(
      `mongodb+srv://${user}:${password}@${url}/${db}?retryWrites=true&w=majority`,
    );
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.log('Error while setting up mongo connection', error);
    throw error;
  }
};

// mongodb+srv://jarik13a_db_user:X8l6FvB8EOrmJ2jC@cluster0.mc49c4m.mongodb.net/productionLog?retryWrites=true&w=majority
