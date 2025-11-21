export const getHistoryForRank = (
  rank: number,
  matrix: Float32Array,
  dates: Date[],
  buckets: number[] | Uint32Array
): [Date, number][] => {
  if (!matrix || !dates || !buckets || buckets.length === 0) {
    return [];
  }

  // 1. Find indices
  let idx_low = 0;
  let idx_high = buckets.length - 1;

  // Simple binary search or linear scan since buckets are sorted
  for (let i = 0; i < buckets.length - 1; i++) {
    if (buckets[i] <= rank && buckets[i + 1] >= rank) {
      idx_low = i;
      idx_high = i + 1;
      break;
    }
  }

  // Handle out of bounds (clamping)
  if (rank < buckets[0]) {
    idx_low = 0;
    idx_high = 0;
  } else if (rank > buckets[buckets.length - 1]) {
    idx_low = buckets.length - 1;
    idx_high = buckets.length - 1;
  }

  // 2. Calculate interpolation weight
  let w = 0;
  if (idx_low !== idx_high) {
    const log_target = Math.log(rank);
    const log_lower = Math.log(buckets[idx_low]);
    const log_upper = Math.log(buckets[idx_high]);
    w = (log_target - log_lower) / (log_upper - log_lower);
  }

  const result: [Date, number][] = [];
  const num_buckets = buckets.length;

  // 3. Iterate through days
  for (let day_idx = 0; day_idx < dates.length; day_idx++) {
    const value_low = matrix[day_idx * num_buckets + idx_low];
    const value_high = matrix[day_idx * num_buckets + idx_high];

    // 5. Interpolate
    const value = (1 - w) * value_low + w * value_high;
    result.push([dates[day_idx], value]);
  }

  return result;
};

export const interpolateSorted = (target: number, data: [number, number][]): number => {
  if (!data || data.length === 0) {
    return 0;
  }

  // Binary search for the interval
  let low = 0;
  let high = data.length - 1;

  if (target <= data[low][0]) {
    return data[low][1];
  }
  if (target >= data[high][0]) {
    return data[high][1];
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (data[mid][0] < target) {
      low = mid + 1;
    } else if (data[mid][0] > target) {
      high = mid - 1;
    } else {
      return data[mid][1];
    }
  }

  let idx = 0;
  let l = 0;
  let r = data.length - 1;

  // Find the first element >= target
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (data[mid][0] >= target) {
      idx = mid;
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }

  // data[idx] is the upper bound. data[idx-1] is the lower bound.
  const upper = data[idx];
  const lower = data[idx - 1];

  if (!lower) {
    return upper[1]; // Should be handled by initial check
  }

  const t = (target - lower[0]) / (upper[0] - lower[0]);
  return (1 - t) * lower[1] + t * upper[1];
};
