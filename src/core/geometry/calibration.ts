// Calibration math (spec.md §3): converting a distance measured in the current
// mm working space into an updated pixels-per-mm scale for a reference image.

import type { Point2D } from '../model/types';

export function pixelDistance(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Recomputes an image's pixelsPerMm given two points clicked in the current
 * mm working space and the real-world distance (in mm) the user says they
 * represent. Works whether or not the image was previously calibrated,
 * because the current mm-space distance is always consistent with the
 * image's current pixelsPerMm at the moment of measurement.
 */
export function computeRecalibratedPixelsPerMm(
  mmDistance: number,
  currentPixelsPerMm: number,
  realWorldMm: number,
): number {
  const imagePixelDistance = mmDistance * currentPixelsPerMm;
  return imagePixelDistance / realWorldMm;
}
