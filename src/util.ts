import { Colors } from './conf';

/**
 * Converts day IDs like 20240420 to `Date`s.
 */
export const dayIDToDate = (dayID: number): Date => {
  const dayIDString = `${dayID}`;
  return new Date(
    parseInt(dayIDString.slice(0, 4), 10),
    parseInt(dayIDString.slice(4, 6), 10) - 1,
    parseInt(dayIDString.slice(6), 10)
  );
};

export const colorPlacement = (placement: number): string => {
  if (placement <= 10) {
    return Colors.SS;
  } else if (placement <= 50) {
    return Colors.S;
  } else {
    return Colors.White;
  }
};

export const colorPercentile = (percentile: number): string => {
  if (percentile <= 1) {
    return Colors.SS;
  } else if (percentile <= 10) {
    return Colors.S;
  } else if (percentile <= 50) {
    return Colors.A;
  } else {
    return Colors.White;
  }
};
