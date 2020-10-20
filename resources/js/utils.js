/**
 * Takes numbers like 19640000000, 1100000, 1200 and formats them like 19.6B, 1.1M, or 1.2K for ease of human readability.
 *
 * @param value
 * @param n_digits
 * @returns {*}
 */
export function number_to_human(value, n_digits = 2) {
  if (typeof value === "string") {
    // noinspection RegExpRedundantEscape
    value = Number.parseFloat(value.replace(/[,\(\)$%]/g, ''));
  }
  let unit = '';
  let exp = 0;
  value = Number.parseFloat(value);
  const _v = Math.log10(value);
  if (_v >= 12) {
    unit = 'T';
    exp = 12;
  } else if (_v >= 9) {
    unit = 'B';
    exp = 9;
  } else if (_v >= 6) {
    unit = 'M';
    exp = 6;
  } else if (_v >= 3) {
    unit = 'K';
    exp = 3;
  }
  return round_to_n_significant_figures(value / Math.pow(10, exp), n_digits,) + unit;
}


/**
 * Round to the given number of significant figures.
 * @param {number} x Number to round
 * @param {int} n_digits Number of significant figures, also used to determine the threshold at which very small values should round to 0.
 * @return {number}
 */
export function round_to_n_significant_figures(x, n_digits) {
  if (typeof x !== "number") {
    x = Number.parseFloat(String(x));
  }
  if (n_digits < 1) {
    throw Error('Cannot round to less than 1 significant figures!')
  }
  if (!Number.isFinite(x) || x === 0) {
    return x
  }
  if (Math.abs(x) < (Math.pow(10, - n_digits))){
    return 0
  }
  let _n = n_digits - Math.trunc(Math.floor(Math.log10(Math.abs(x)))) - 1;

  return round(x, _n);
}

/**
 * Rounds to n_digits of precision. Copied from Lodash's rounding function.
 * @param number
 * @param n_digits
 * @return {number}
 */
export function round(number, n_digits) {
  n_digits = n_digits == null ? 0 : Math.min(n_digits, 292)
  if (n_digits) {
    // Shift with exponential notation to handle floating-points as well as ints.
    let pair = `${number}e`.split('e')
    const value = Math.round(`${pair[0]}e${+pair[1] + n_digits}`)

    pair = `${value}e`.split('e')
    return +`${pair[0]}e${+pair[1] - n_digits}`
  }
  return Math.round(number)
}
