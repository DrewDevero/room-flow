import { describe, expect, it } from 'vitest';
import { orientedRectsOverlap, type OrientedRect } from './overlap';

function rect(cx: number, cy: number, w: number, d: number, angleDeg = 0): OrientedRect {
  return { center: { x: cx, y: cy }, halfWidth: w / 2, halfDepth: d / 2, angleRad: (angleDeg * Math.PI) / 180 };
}

describe('orientedRectsOverlap', () => {
  it('detects overlap of two axis-aligned overlapping rects', () => {
    const a = rect(0, 0, 100, 100);
    const b = rect(50, 0, 100, 100);
    expect(orientedRectsOverlap(a, b)).toBe(true);
  });

  it('detects no overlap when rects are far apart', () => {
    const a = rect(0, 0, 100, 100);
    const b = rect(500, 0, 100, 100);
    expect(orientedRectsOverlap(a, b)).toBe(false);
  });

  it('detects no overlap for adjacent (touching-but-not-crossing) rects', () => {
    const a = rect(0, 0, 100, 100);
    const b = rect(150, 0, 100, 100);
    // gap between them: a spans [-50,50], b spans [100,200] -> no overlap
    expect(orientedRectsOverlap(a, b)).toBe(false);
  });

  it('detects overlap between a rotated rect and an axis-aligned rect', () => {
    const a = rect(0, 0, 200, 20); // long horizontal rect
    const b = rect(0, 0, 20, 200, 90); // rotated 90deg, same footprint essentially
    expect(orientedRectsOverlap(a, b)).toBe(true);
  });

  it('separating axis correctly rules out overlap for rotated rects', () => {
    const a = rect(0, 0, 100, 20, 45);
    const b = rect(200, 200, 100, 20, 45);
    expect(orientedRectsOverlap(a, b)).toBe(false);
  });
});
