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

export const colorPlacement = (placement: number | null | undefined): string => {
  if (typeof placement !== 'number') {
    return Colors.White;
  } else if (placement <= 10) {
    return Colors.SS;
  } else if (placement <= 50) {
    return Colors.S;
  } else {
    return Colors.White;
  }
};

export const colorPercentile = (percentile: number | null | undefined): string => {
  if (typeof percentile !== 'number') {
    return Colors.White;
  } else if (percentile <= 1) {
    return Colors.SS;
  } else if (percentile <= 10) {
    return Colors.S;
  } else if (percentile <= 50) {
    return Colors.A;
  } else {
    return Colors.White;
  }
};

export const getRankColor = (rank: string): string => {
  if (rank === 'SS' || rank === 'X' || rank === 'XH') {
    return Colors.SS;
  } else if (rank === 'S' || rank === 'SH') {
    return Colors.S;
  } else if (rank === 'A') {
    return Colors.A;
  } else if (rank === 'B') {
    return Colors.B;
  } else if (rank === 'C') {
    return Colors.C;
  } else if (rank === 'D') {
    return Colors.D;
  } else {
    return Colors.White;
  }
};

export const DateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export const formatDayID = (dayID: number) => {
  const date = dayIDToDate(dayID);
  return DateFormatter.format(date);
};

export const IntegerFormatter = new Intl.NumberFormat(undefined, {
  style: 'decimal',
  maximumFractionDigits: 0,
});

export const TotalScoreFormatter = new Intl.NumberFormat(undefined, {
  // using suffixes like K and M
  notation: 'compact',
  maximumFractionDigits: 3,
});

export const FloatFormatter = new Intl.NumberFormat(undefined, {
  style: 'decimal',
  maximumFractionDigits: 2,
});
