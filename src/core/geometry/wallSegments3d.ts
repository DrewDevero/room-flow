// Splits a wall into renderable 3D box segments around its door/window
// openings, so the 3D preview reflects openings instead of solid walls
// (spec.md §7). Door openings are a full-height gap up to door height, with
// a header above; windows leave a glazed gap between sill and header.

import type { Wall } from '../model/types';
import { wallLength } from './openings';

export const DOOR_HEIGHT_MM = 2030;
export const WINDOW_SILL_HEIGHT_MM = 900;
export const WINDOW_HEADER_HEIGHT_MM = 2100;

export type WallSegmentMaterial = 'wall' | 'glass';

export interface WallSegment3D {
  offsetStartMm: number;
  offsetEndMm: number;
  bottomMm: number;
  topMm: number;
  material: WallSegmentMaterial;
}

export function buildWallSegments3D(wall: Wall): WallSegment3D[] {
  const length = wallLength(wall);
  const segments: WallSegment3D[] = [];
  const sortedOpenings = [...wall.openings].sort((a, b) => a.offsetMm - b.offsetMm);
  let cursor = 0;

  for (const opening of sortedOpenings) {
    const start = Math.max(cursor, opening.offsetMm);
    const end = Math.min(length, opening.offsetMm + opening.widthMm);
    if (start >= end) continue;

    if (start > cursor) {
      segments.push({ offsetStartMm: cursor, offsetEndMm: start, bottomMm: 0, topMm: wall.heightMm, material: 'wall' });
    }

    if (opening.type === 'door') {
      const doorHeight = Math.min(DOOR_HEIGHT_MM, wall.heightMm);
      if (wall.heightMm > doorHeight) {
        segments.push({ offsetStartMm: start, offsetEndMm: end, bottomMm: doorHeight, topMm: wall.heightMm, material: 'wall' });
      }
    } else {
      const sill = Math.min(WINDOW_SILL_HEIGHT_MM, wall.heightMm);
      const header = Math.min(Math.max(WINDOW_HEADER_HEIGHT_MM, sill), wall.heightMm);
      if (sill > 0) {
        segments.push({ offsetStartMm: start, offsetEndMm: end, bottomMm: 0, topMm: sill, material: 'wall' });
      }
      if (header > sill) {
        segments.push({ offsetStartMm: start, offsetEndMm: end, bottomMm: sill, topMm: header, material: 'glass' });
      }
      if (wall.heightMm > header) {
        segments.push({ offsetStartMm: start, offsetEndMm: end, bottomMm: header, topMm: wall.heightMm, material: 'wall' });
      }
    }

    cursor = end;
  }

  if (cursor < length) {
    segments.push({ offsetStartMm: cursor, offsetEndMm: length, bottomMm: 0, topMm: wall.heightMm, material: 'wall' });
  }

  return segments;
}
