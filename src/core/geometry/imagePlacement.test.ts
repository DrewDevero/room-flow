import { describe, expect, it } from 'vitest';
import { centeredImageOffsetMm } from './imagePlacement';

describe('centeredImageOffsetMm', () => {
  it('centers a 1:1 px-per-mm image on the origin', () => {
    expect(centeredImageOffsetMm(2000, 1000, 1)).toEqual({ x: -1000, y: -500 });
  });

  it('accounts for a non-default pixelsPerMm scale', () => {
    expect(centeredImageOffsetMm(2000, 1000, 2)).toEqual({ x: -500, y: -250 });
  });
});
