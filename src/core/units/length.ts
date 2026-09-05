// Length parsing/formatting utilities (spec.md §1). All internal storage is in mm.

const MM_PER_INCH = 25.4;
const MM_PER_FOOT = MM_PER_INCH * 12;
const MM_PER_CM = 10;
const MM_PER_M = 1000;
const MM2_PER_SQFT = (MM_PER_FOOT) * (MM_PER_FOOT);

/** Formats an area (in mm^2) as sqft or sqm depending on the active unit system. */
export function formatArea(mm2: number, unitSystem: 'imperial' | 'metric'): string {
  if (unitSystem === 'imperial') {
    return `${(mm2 / MM2_PER_SQFT).toFixed(1)} sqft`;
  }
  return `${(mm2 / 1_000_000).toFixed(2)} m²`;
}

/**
 * Parses a user-entered length string into millimeters.
 * Supports: 18'-5", 18' 5", 18'5", 5.63m, 563cm, 221.5", 12 (bare number => current unit system default).
 */
export function parseLength(input: string, unitSystem: 'imperial' | 'metric'): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Feet + inches, e.g. 18'-5", 18' 5", 18'5"
  const feetInchesMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*'\s*-?\s*(\d+(?:\.\d+)?)?\s*"?$/,
  );
  if (feetInchesMatch) {
    const feet = Number(feetInchesMatch[1]);
    const inches = feetInchesMatch[2] ? Number(feetInchesMatch[2]) : 0;
    return feet * MM_PER_FOOT + inches * MM_PER_INCH;
  }

  // Inches only, e.g. 221.5"
  const inchesMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*"$/);
  if (inchesMatch) {
    return Number(inchesMatch[1]) * MM_PER_INCH;
  }

  // Meters, e.g. 5.63m
  const metersMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*m$/i);
  if (metersMatch) {
    return Number(metersMatch[1]) * MM_PER_M;
  }

  // Centimeters, e.g. 563cm
  const cmMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*cm$/i);
  if (cmMatch) {
    return Number(cmMatch[1]) * MM_PER_CM;
  }

  // Millimeters, e.g. 1234mm
  const mmMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*mm$/i);
  if (mmMatch) {
    return Number(mmMatch[1]);
  }

  // Bare number: interpret using the active unit system's base unit (feet for imperial, cm for metric).
  const bareMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (bareMatch) {
    const value = Number(bareMatch[1]);
    return unitSystem === 'imperial' ? value * MM_PER_FOOT : value * MM_PER_CM;
  }

  return null;
}

/**
 * Formats a millimeter length for display, either as feet-inches (nearest 1/8")
 * or metric (cm, 1 decimal).
 */
export function formatLength(mm: number, unitSystem: 'imperial' | 'metric'): string {
  if (unitSystem === 'metric') {
    if (Math.abs(mm) >= MM_PER_M) {
      return `${(mm / MM_PER_M).toFixed(2)}m`;
    }
    return `${(mm / MM_PER_CM).toFixed(1)}cm`;
  }

  const totalInches = mm / MM_PER_INCH;
  const feet = Math.trunc(totalInches / 12);
  const remainderInches = Math.abs(totalInches) - Math.abs(feet) * 12;
  const roundedEighths = Math.round(remainderInches * 8);
  let inchesWhole = Math.trunc(roundedEighths / 8);
  const eighths = roundedEighths % 8;

  if (eighths === 0) {
    return `${feet}'-${inchesWhole}"`;
  }

  // Reduce eighths to simplest fraction (e.g. 4/8 -> 1/2)
  const divisor = gcd(eighths, 8);
  const numerator = eighths / divisor;
  const denominator = 8 / divisor;

  if (inchesWhole === 12) {
    inchesWhole = 0;
  }

  return `${feet}'-${inchesWhole} ${numerator}/${denominator}"`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
