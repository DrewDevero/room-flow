import { describe, expect, it } from 'vitest';
import { formatLength, parseLength } from './length';

describe('parseLength', () => {
  it('parses feet-inches with hyphen', () => {
    expect(parseLength("18'-5\"", 'imperial')).toBeCloseTo(18 * 304.8 + 5 * 25.4);
  });

  it('parses feet-inches with space', () => {
    expect(parseLength("18' 5\"", 'imperial')).toBeCloseTo(18 * 304.8 + 5 * 25.4);
  });

  it('parses feet only', () => {
    expect(parseLength("18'", 'imperial')).toBeCloseTo(18 * 304.8);
  });

  it('parses inches only', () => {
    expect(parseLength('221.5"', 'imperial')).toBeCloseTo(221.5 * 25.4);
  });

  it('parses meters', () => {
    expect(parseLength('5.63m', 'metric')).toBeCloseTo(5630);
  });

  it('parses centimeters', () => {
    expect(parseLength('563cm', 'metric')).toBeCloseTo(5630);
  });

  it('parses millimeters', () => {
    expect(parseLength('1234mm', 'metric')).toBeCloseTo(1234);
  });

  it('parses a bare number using imperial default (feet)', () => {
    expect(parseLength('12', 'imperial')).toBeCloseTo(12 * 304.8);
  });

  it('parses a bare number using metric default (cm)', () => {
    expect(parseLength('12', 'metric')).toBeCloseTo(120);
  });

  it('returns null for empty input', () => {
    expect(parseLength('', 'imperial')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(parseLength('not a length', 'imperial')).toBeNull();
  });
});

describe('formatLength', () => {
  it('formats whole feet with no remainder', () => {
    expect(formatLength(18 * 304.8, 'imperial')).toBe("18'-0\"");
  });

  it('formats feet and inches', () => {
    expect(formatLength(18 * 304.8 + 5 * 25.4, 'imperial')).toBe("18'-5\"");
  });

  it('formats fractional inches', () => {
    expect(formatLength(5 * 25.4 + 12.7, 'imperial')).toBe("0'-5 1/2\"");
  });

  it('formats metric under 1m as cm', () => {
    expect(formatLength(563, 'metric')).toBe('56.3cm');
  });

  it('formats metric over 1m as m', () => {
    expect(formatLength(5630, 'metric')).toBe('5.63m');
  });
});
