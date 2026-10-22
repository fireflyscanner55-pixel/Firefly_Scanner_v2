export interface SimulationRange {
  target: number;
  min: number;
  max: number;
}

export function randomBetween(
  min: number,
  max: number
): number {
  return Math.random() * (max - min) + min;
}

export function nextSimulationValue(
  range: SimulationRange,
  previousValue?: number
): number {
  const {
    target,
    min,
    max,
  } = range;

  if (previousValue === undefined) {
    return target;
  }

  const targetPull =
    (target - previousValue) * 0.15;

  const fluctuation =
    (Math.random() - 0.5) *
    (max - min) *
    0.08;

  let nextValue =
    previousValue +
    targetPull +
    fluctuation;

  nextValue = Math.max(min, nextValue);
  nextValue = Math.min(max, nextValue);

  return nextValue;
}

export function roundValue(
  value: number,
  decimals = 2
): number {
  const multiplier = Math.pow(10, decimals);

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}