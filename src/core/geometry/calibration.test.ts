import { describe, expect, it } from 'vitest';
import { computeRecalibratedPixelsPerMm, pixelDistance } from './calibration';

describe('pixelDistance', () => {
  it('computes euclidean distance between two points', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('computeRecalibratedPixelsPerMm', () => {
  it('computes a new scale from a first calibration (default scale of 1)', () => {
    // 500mm of on-screen distance, default scale 1 image-px per mm,
    // user says that distance is actually 5000mm (5m) in the real world.
    const result = computeRecalibratedPixelsPerMm(500, 1, 5000);
    expect(result).toBeCloseTo(0.1);
  });

  it('is self-consistent across repeated recalibration', () => {
    // Starting scale of 2 image-px per mm, mm-space distance of 200mm
    // (i.e. 400 image px), user re-declares that as 1000mm real-world.
    const result = computeRecalibratedPixelsPerMm(200, 2, 1000);
    expect(result).toBeCloseTo(0.4);
  });
});
