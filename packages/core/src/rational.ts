import { RationalFraction } from './types.js';

/**
 * Compute the greatest common divisor of two non-negative integers using Euclidean algorithm.
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x === 0 ? 1 : x;
}

/**
 * Compute the least common multiple of two positive integers.
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

/**
 * Construct a normalized, lowest-terms RationalFraction.
 */
export function createRational(numerator: number, denominator = 1): RationalFraction {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    throw new Error(`Invalid rational fraction: ${numerator}/${denominator}`);
  }
  const sign = denominator < 0 ? -1 : 1;
  const num = Math.trunc(numerator) * sign;
  const den = Math.trunc(denominator) * sign;
  if (num === 0) {
    return { numerator: 0, denominator: 1 };
  }
  const divisor = gcd(num, den);
  return {
    numerator: num / divisor,
    denominator: den / divisor,
  };
}

/**
 * Add two rational fractions in exact arithmetic and reduce to lowest terms.
 */
export function addRational(a: RationalFraction, b: RationalFraction): RationalFraction {
  const commonDen = lcm(a.denominator, b.denominator);
  const numA = a.numerator * (commonDen / a.denominator);
  const numB = b.numerator * (commonDen / b.denominator);
  return createRational(numA + numB, commonDen);
}

/**
 * Multiply two rational fractions in exact arithmetic and reduce to lowest terms.
 */
export function multiplyRational(a: RationalFraction, b: RationalFraction): RationalFraction {
  return createRational(a.numerator * b.numerator, a.denominator * b.denominator);
}

/**
 * Divide a rational fraction by a positive integer subdivision count.
 */
export function divideRationalByInt(r: RationalFraction, count: number): RationalFraction {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`Subdivision count must be a positive integer, got ${count}`);
  }
  return createRational(r.numerator, r.denominator * count);
}

/**
 * Convert a RationalFraction to an IEEE-754 floating-point number.
 */
export function rationalToNumber(r: RationalFraction): number {
  return r.numerator / r.denominator;
}

/**
 * Format a RationalFraction as a canonical string (e.g., "1", "1/2", "1/6").
 */
export function formatRational(r: RationalFraction): string {
  const reduced = createRational(r.numerator, r.denominator);
  return reduced.denominator === 1
    ? `${reduced.numerator}`
    : `${reduced.numerator}/${reduced.denominator}`;
}
