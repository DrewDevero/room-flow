// Computes the offset (top-left position in mm) needed to center a reference
// image on the grid origin, given its pixel size and current calibration.

import type { Point2D } from '../model/types';

export function centeredImageOffsetMm(
  naturalWidthPx: number,
  naturalHeightPx: number,
  pixelsPerMm: number,
): Point2D {
  return {
    x: -(naturalWidthPx / pixelsPerMm) / 2,
    y: -(naturalHeightPx / pixelsPerMm) / 2,
  };
}
