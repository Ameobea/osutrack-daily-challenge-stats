const nowMs = Date.now();

export const formatDateDiff = (
  from: Date | number,
  rtfOptions: Intl.RelativeTimeFormatOptions = { numeric: 'always' }
): string => {
  const fromMs = typeof from === 'number' ? from : from.getTime();
  const toMs = nowMs;

  let delta = toMs - fromMs;
  const FIFTY_YEARS_MS = 50 * 365.25 * 24 * 60 * 60 * 1000;
  delta = Math.max(-FIFTY_YEARS_MS, Math.min(FIFTY_YEARS_MS, delta));

  const abs = Math.abs(delta);

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30.44 * DAY;
  const YEAR = 365.25 * DAY;

  type Unit = Intl.RelativeTimeFormatUnit;
  let unit: Unit;
  let value: number;

  if (abs < 45 * SECOND) {
    unit = 'second';
    value = Math.max(1, Math.round(abs / SECOND));
  } else if (abs < 90 * SECOND) {
    unit = 'minute';
    value = 1;
  } else if (abs < 45 * MINUTE) {
    unit = 'minute';
    value = Math.round(abs / MINUTE);
  } else if (abs < 90 * MINUTE) {
    unit = 'hour';
    value = 1;
  } else if (abs < 22 * HOUR) {
    unit = 'hour';
    value = Math.round(abs / HOUR);
  } else if (abs < 36 * HOUR) {
    unit = 'day';
    value = 1;
  } else if (abs < 25 * DAY) {
    unit = 'day';
    value = Math.round(abs / DAY);
  } else if (abs < 45 * DAY) {
    unit = 'month';
    value = 1;
  } else if (abs < 345 * DAY) {
    unit = 'month';
    value = Math.round(abs / MONTH);
  } else if (abs < 545 * DAY) {
    unit = 'year';
    value = 1;
  } else {
    unit = 'year';
    value = Math.round(abs / YEAR);
  }

  const signed = delta > 0 ? -value : value;

  if (typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function') {
    const rtf = new Intl.RelativeTimeFormat(undefined, rtfOptions);
    return rtf.format(signed, unit);
  } else {
    const plural = (n: number, u: string) => (Math.abs(n) === 1 ? u : `${u}s`);
    return signed < 0
      ? `${Math.abs(signed)} ${plural(signed, unit)} ago`
      : `in ${signed} ${plural(signed, unit)}`;
  }
};
