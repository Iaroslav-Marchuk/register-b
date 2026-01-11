import { buildDayRangeQuery } from './normalizeData.js';

function parseNumber(value) {
  const isString = typeof value === 'string';
  if (!isString) return;

  const parsedNumber = parseInt(value);
  if (Number.isNaN(parsedNumber)) {
    return;
  }

  return parsedNumber;
}

function parseText(value) {
  if (!value) return undefined;
  return value.trim();
}

// function parseDate(value) {
//   if (!value) return undefined;
//   const date = new Date(value);
//   if (isNaN(date.getTime())) return undefined;

//   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
// }

export function parseFilterParams(query) {
  const { ep, client, createdAt, local } = query;

  const parsedEP = parseNumber(ep);
  const parsedClient = parseText(client);
  const parsedDate = createdAt ? buildDayRangeQuery(createdAt) : undefined;
  const parsedLocal = parseText(local);

  return {
    ep: parsedEP,
    client: parsedClient,
    createdAt: parsedDate,
    local: parsedLocal,
  };
}
