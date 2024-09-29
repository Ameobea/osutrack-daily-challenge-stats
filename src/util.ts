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
