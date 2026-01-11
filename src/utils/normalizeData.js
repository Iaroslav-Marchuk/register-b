export function normalizeDate(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export const buildDayRangeQuery = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(24, 0, 0, 0);

  return {
    $gte: start,
    $lt: end,
  };
};
