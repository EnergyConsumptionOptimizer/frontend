import { format, parseISO, isValid } from "date-fns";

const strategies = {
  daily: (d) => format(d, "yyyy-MM-dd"),
  monthly: (d) => format(d, "yyyy-MM"),
  weekly: (d) => format(d, "RRRR-'W'II"),
};

export function aggregateForecastData(points = [], period = "daily") {
  if (!points || !points.length) return { labels: [], values: [] };

  const getLabel = strategies[period] || strategies.daily;
  const accumulator = new Map();

  for (const p of points) {
    const date = parseISO(p.date);
    if (!isValid(date)) continue;

    const key = getLabel(date);
    const val = Number(p.predictedConsumption) || 0;
    accumulator.set(key, (accumulator.get(key) || 0) + val);
  }
  const sortedKeys = Array.from(accumulator.keys()).sort();

  return {
    labels: sortedKeys,
    values: sortedKeys.map((k) => Number(accumulator.get(k).toFixed(2))),
  };
}
