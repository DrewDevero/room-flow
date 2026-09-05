// Helpers for placing openings (doors/windows) along the nearest wall (spec.md §4-5).

import type { Point2D, Wall } from '../model/types';
import { projectPointOntoSegment } from './walls';

export interface NearestWallHit {
  wall: Wall;
  offsetMm: number;
  wallLengthMm: number;
  distanceMm: number;
}

export function wallLength(wall: Wall): number {
  return Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
}

export function findNearestWall(
  point: Point2D,
  walls: Wall[],
  maxDistanceMm: number,
): NearestWallHit | null {
  let best: NearestWallHit | null = null;

  for (const wall of walls) {
    const projection = projectPointOntoSegment(point, wall.start, wall.end);
    if (projection.distance > maxDistanceMm) continue;
    if (!best || projection.distance < best.distanceMm) {
      best = {
        wall,
        offsetMm: projection.t * wallLength(wall),
        wallLengthMm: wallLength(wall),
        distanceMm: projection.distance,
      };
    }
  }

  return best;
}

/** Clamps a proposed opening span so it fits within the wall's length. */
export function clampOpeningOffset(
  centerOffsetMm: number,
  widthMm: number,
  wallLengthMm: number,
): number {
  const minOffset = 0;
  const maxOffset = Math.max(0, wallLengthMm - widthMm);
  return Math.min(maxOffset, Math.max(minOffset, centerOffsetMm - widthMm / 2));
}
