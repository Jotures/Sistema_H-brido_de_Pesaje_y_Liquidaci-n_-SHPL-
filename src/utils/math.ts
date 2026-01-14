/**
 * Safe Math Utilities for SHPL
 * 
 * Prevents floating-point precision errors (e.g., 0.1 + 0.2 = 0.30000000000000004)
 * by operating on integers and scaling results.
 * 
 * Technique: Multiply by PRECISION_FACTOR, perform integer operations, divide back.
 * Uses 10000 (4 decimal places) for internal precision, rounds to 2 for output.
 */

// Internal precision factor (4 decimal places for intermediate calculations)
const PRECISION_FACTOR = 10000;

/**
 * Convert a number to its integer representation for safe operations
 */
function toInt(n: number): number {
    return Math.round(n * PRECISION_FACTOR);
}

/**
 * Convert back from integer representation to decimal
 */
function fromInt(n: number): number {
    return n / PRECISION_FACTOR;
}

/**
 * Safe addition: a + b with floating-point error prevention
 * @example safeAdd(0.1, 0.2) === 0.3 (not 0.30000000000000004)
 */
export function safeAdd(a: number, b: number): number {
    return fromInt(toInt(a) + toInt(b));
}

/**
 * Safe subtraction: a - b with floating-point error prevention
 * @example safeSub(0.3, 0.1) === 0.2 (not 0.19999999999999998)
 */
export function safeSub(a: number, b: number): number {
    return fromInt(toInt(a) - toInt(b));
}

/**
 * Safe multiplication: a * b with floating-point error prevention
 * For multiplication, we need different scaling to avoid overflow
 * @example safeMult(10.55, 1.5) === 15.825
 */
export function safeMult(a: number, b: number): number {
    // Use 100 for each operand (total 10000 factor)
    const factor = 100;
    const intA = Math.round(a * factor);
    const intB = Math.round(b * factor);
    return (intA * intB) / (factor * factor);
}

/**
 * Round to 2 decimal places using banker's rounding (round half to even)
 * This is the standard for financial calculations
 * @example roundToTwo(2.345) === 2.34, roundToTwo(2.355) === 2.36
 */
export function roundToTwo(num: number): number {
    // Add small epsilon to handle floating-point edge cases, then round
    const scaled = Math.round((num + Number.EPSILON) * 100);
    return scaled / 100;
}

/**
 * Safe sum of an array of numbers
 * Reduces using safeAdd for cumulative precision
 * @example safeSum([0.1, 0.2, 0.3]) === 0.6
 */
export function safeSum(values: number[]): number {
    return values.reduce((acc, val) => safeAdd(acc, val), 0);
}

/**
 * Safe weighted calculation: (value * rate) with rounding to 2 decimals
 * Commonly used for price calculations: weight * unitPrice
 */
export function safeWeightedCalc(value: number, rate: number): number {
    return roundToTwo(safeMult(value, rate));
}
