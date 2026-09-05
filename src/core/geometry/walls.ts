// Geometry helpers for wall drawing, snapping, and room area (spec.md §4).

import type { Point2D, Room, Wall } from '../model/types';

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Resolves a room's wallIds into an ordered polygon of points (each wall's start point). */
export function resolveRoomPolygon(room: Room, walls: Wall[]): Point2D[] {
  return room.wallIds
    .map((wallId) => walls.find((w) => w.id === wallId)?.start)
    .filter((p): p is Point2D => Boolean(p));
}

/** Projects point p onto segment ab, returning the closest point, distance, and t in [0,1]. */
export function projectPointOntoSegment(
  p: Point2D,
  a: Point2D,
  b: Point2D,
): { point: Point2D; t: number; distance: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSq = abx * abx + aby * aby;

  if (lengthSq === 0) {
    return { point: a, t: 0, distance: distance(p, a) };
  }

  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lengthSq));
  const point = { x: a.x + t * abx, y: a.y + t * aby };
  return { point, t, distance: distance(p, point) };
}

/** Snaps `point` to the nearest candidate within thresholdMm, else returns point unchanged. */
export function snapToNearbyPoint(
  point: Point2D,
  candidates: Point2D[],
  thresholdMm: number,
): Point2D {
  let closest: Point2D | null = null;
  let closestDist = thresholdMm;
  for (const candidate of candidates) {
    const d = distance(point, candidate);
    if (d <= closestDist) {
      closest = candidate;
      closestDist = d;
    }
  }
  return closest ?? point;
}

/** Snaps the angle of `point` relative to `origin` to the nearest increment (default 15deg). */
export function snapToAngle(origin: Point2D, point: Point2D, incrementDeg = 15): Point2D {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return point;

  const angleRad = Math.atan2(dy, dx);
  const incrementRad = (incrementDeg * Math.PI) / 180;
  const snappedAngle = Math.round(angleRad / incrementRad) * incrementRad;

  return {
    x: origin.x + Math.cos(snappedAngle) * dist,
    y: origin.y + Math.sin(snappedAngle) * dist,
  };
}

/** Shoelace formula; returns area in mm^2 (always positive) for a closed polygon. */
export function polygonAreaMm2(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

export function polygonCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}
