import { SORT_ORDER } from '../constants/constants.js';

const allowedKeys = ['ep', 'client', 'createdAt'];

function parseSortOrder(sortOrder) {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
}

function parseSortBy(sortBy) {
  if (allowedKeys.includes(sortBy)) {
    return sortBy;
  }
  return 'createdAt';
}

export function parseSortParams(query) {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  };
}
