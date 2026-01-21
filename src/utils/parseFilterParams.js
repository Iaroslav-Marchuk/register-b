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
