import { UsersCollection } from './db/models/userModel.js';
import { OrdersCollection } from './db/models/orderModel.js';

import 'dotenv/config';
import { initMongoDB } from '../src/db/initMongoDB.js';

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min, max) => Math.random() * (max - min) + min;

const locals = ['Linha 1', 'Linha 2', 'Linha 3'];
const MAX_EP = 15000;

const possibleNotes = [
  'w/e preto',
  'Quadrícula',
  'Triplo',
  'Montra (>2000mm)',
  'Molde',
  'Redondo',
  'w/e cinza',
  'Super Spacer',
  'Comprido (>3500mm)',
  'Decalado',
  'Comutável',
  'Reposição',
];

function generateOrdersForEP(date, user, ep, line) {
  const orders = [];

  const totalItems = randomInt(10, 150);

  let completedItems;
  let completedM2;

  if (Math.random() < 0.8) {
    completedItems = totalItems;
    completedM2 = Number(randomFloat(250, 450).toFixed(2));
  } else {
    completedItems = randomInt(Math.floor(totalItems * 0.2), totalItems);
    completedM2 = Number(
      ((completedItems / totalItems) * randomFloat(250, 450)).toFixed(2),
    );
  }

  const totalM2 = Number(
    (completedM2 * (totalItems / completedItems)).toFixed(2),
  );
  const isFinal = completedItems === totalItems;

  const checkedNotes =
    Math.random() > 0.7
      ? (() => {
          const shuffled = [...possibleNotes].sort(() => 0.5 - Math.random());
          const count = Math.floor(Math.random() * 2) + 1;
          return shuffled.slice(0, count);
        })()
      : [];

  const createdOrder = {
    ep,
    type: 'created',
    client: `Cliente ${randomInt(1, 200)}`,
    totalItems,
    totalM2,
    completedItems,
    completedM2,
    missedItems: totalItems - completedItems,
    missedM2: Number((totalM2 - completedM2).toFixed(2)),
    isFinal,
    local: line,
    owner: user._id,
    createdAt: date,
    updatedAt: date,
    butylLot: Math.random() > 0.7 ? `BUT-${randomInt(100, 999)}` : undefined,
    silicaLot: Math.random() > 0.7 ? `SIL-${randomInt(100, 999)}` : undefined,
    polysulfideLot: {
      white: Math.random() > 0.7 ? `POL-W-${randomInt(100, 999)}` : undefined,
      black: Math.random() > 0.7 ? `POL-B-${randomInt(100, 999)}` : undefined,
    },
    checkedNotes: checkedNotes,
  };

  orders.push(createdOrder);

  let lastCompleted = completedItems;
  let lastDate = date;

  if (!isFinal && Math.random() > 0.5) {
    const additional = randomInt(1, totalItems - lastCompleted);
    const newCompleted = lastCompleted + additional;
    const newCompletedM2 = Number(
      ((newCompleted / totalItems) * totalM2).toFixed(2),
    );
    const contDate = new Date(lastDate.getTime() + 86400000);

    const contOrder = {
      ep,
      type: 'continued',
      client: createdOrder.client,
      totalItems,
      totalM2,
      completedItems: newCompleted,
      completedM2: newCompletedM2,
      missedItems: totalItems - newCompleted,
      missedM2: Number((totalM2 - newCompletedM2).toFixed(2)),
      isFinal: newCompleted === totalItems,
      local: line,
      owner: user._id,
      createdAt: contDate,
      updatedAt: contDate,
    };

    orders.push(contOrder);
    lastCompleted = newCompleted;
    lastDate = contDate;
  }

  if (orders[orders.length - 1].isFinal && Math.random() > 0.7) {
    const recDate = new Date(lastDate.getTime() + 86400000);

    const recOrder = {
      ep,
      type: 'recovered',
      client: createdOrder.client,
      totalItems,
      totalM2,
      completedItems: totalItems,
      completedM2: totalM2,
      missedItems: 0,
      missedM2: 0,
      isFinal: true,
      local: line,
      owner: user._id,
      createdAt: recDate,
      updatedAt: recDate,
    };

    orders.push(recOrder);
  }

  return orders;
}

async function seed() {
  await initMongoDB();
  console.log('✅ Connected to DB');

  const users = await UsersCollection.find();
  if (!users.length) throw new Error('No users found in DB');

  await OrdersCollection.deleteMany();
  console.log('🗑 Orders cleared');

  const orders = [];

  const today = new Date();
  const YEARS = [2024, 2025, today.getFullYear()];

  for (const year of YEARS) {
    const startDate = new Date(year, 0, 1);
    const endDate =
      year === today.getFullYear() ? today : new Date(year, 11, 31);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      currentDate.setHours(0, 0, 0, 0);

      const day = currentDate.getDay();
      if (day === 0 || day === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const usedEPs = new Set();

      for (const line of locals) {
        let ep;
        do {
          ep = randomInt(1, MAX_EP);
        } while (usedEPs.has(ep));

        usedEPs.add(ep);

        const user = users[randomInt(0, users.length - 1)];

        const generated = generateOrdersForEP(
          new Date(currentDate),
          user,
          ep,
          line,
        );

        orders.push(...generated);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  await OrdersCollection.insertMany(orders);
  console.log(`🚀 Seeded ${orders.length} orders`);

  process.exit();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
