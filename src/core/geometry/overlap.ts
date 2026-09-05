// Oriented-rectangle overlap detection via the Separating Axis Theorem (spec.md §5).
// Circles and L-shapes are approximated by their bounding rectangle for this
// advisory (non-blocking) check — acceptable for MVP per spec.md §5/§11.

import type { FurnitureInstance, Point2D, Wall } from '../model/types';

export interface OrientedRect {
  center: Point2D;
  halfWidth: number;
  halfDepth: number;
  angleRad: number;
}

export function furnitureToOrientedRect(instance: FurnitureInstance): OrientedRect {
  return {
    center: instance.position,
    halfWidth: instance.widthMm / 2,
    halfDepth: instance.depthMm / 2,
    angleRad: (instance.rotationDeg * Math.PI) / 180,
  };
}

export function wallToOrientedRect(wall: Wall): OrientedRect {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dy);
  return {
    center: { x: (wall.start.x + wall.end.x) / 2, y: (wall.start.y + wall.end.y) / 2 },
    halfWidth: length / 2,
    halfDepth: wall.thicknessMm / 2,
    angleRad: Math.atan2(dy, dx),
  };
}

function getCorners(rect: OrientedRect): Point2D[] {
  const cos = Math.cos(rect.angleRad);
  const sin = Math.sin(rect.angleRad);
  const local = [
    { x: -rect.halfWidth, y: -rect.halfDepth },
    { x: rect.halfWidth, y: -rect.halfDepth },
    { x: rect.halfWidth, y: rect.halfDepth },
    { x: -rect.halfWidth, y: rect.halfDepth },
  ];
  return local.map((p) => ({
    x: rect.center.x + p.x * cos - p.y * sin,
    y: rect.center.y + p.x * sin + p.y * cos,
  }));
}

function getAxes(rect: OrientedRect): Point2D[] {
  return [
    { x: Math.cos(rect.angleRad), y: Math.sin(rect.angleRad) },
    { x: -Math.sin(rect.angleRad), y: Math.cos(rect.angleRad) },
  ];
}

function project(corners: Point2D[], axis: Point2D): { min: number; max: number } {
  const dots = corners.map((c) => c.x * axis.x + c.y * axis.y);
  return { min: Math.min(...dots), max: Math.max(...dots) };
}

export function orientedRectsOverlap(a: OrientedRect, b: OrientedRect): boolean {
  const cornersA = getCorners(a);
  const cornersB = getCorners(b);
  const axes = [...getAxes(a), ...getAxes(b)];

  for (const axis of axes) {
    const pa = project(cornersA, axis);
    const pb = project(cornersB, axis);
    if (pa.max < pb.min || pb.max < pa.min) return false;
  }
  return true;
}
