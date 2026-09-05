import { describe, expect, it } from 'vitest';
import { furnitureToOrientedRect, orientedRectsOverlap, wallToOrientedRect } from './overlap';
import type { FurnitureInstance, Wall } from '../model/types';

// Sanity check for the O(n^2) overlap pass at roughly MVP-scale (plan.md M6:
// "6 rooms, 40 furniture pieces") — should stay well under a frame budget.
describe('overlap detection performance', () => {
  it('checks ~40 furniture pieces against 24 walls quickly', () => {
    const furniture: FurnitureInstance[] = Array.from({ length: 40 }, (_, i) => ({
      id: `f${i}`,
      catalogId: 'basic-rect',
      name: `Item ${i}`,
      shape: 'rect',
      widthMm: 600,
      depthMm: 600,
      heightMm: 750,
      position: { x: (i % 10) * 700, y: Math.floor(i / 10) * 700 },
      rotationDeg: (i * 7) % 360,
      colorHex: '#9ca3af',
    }));

    const walls: Wall[] = Array.from({ length: 24 }, (_, i) => ({
      id: `w${i}`,
      start: { x: i * 500, y: 0 },
      end: { x: i * 500 + 400, y: 300 },
      thicknessMm: 100,
      heightMm: 2440,
      openings: [],
    }));

    const start = performance.now();
    const rects = furniture.map((f) => furnitureToOrientedRect(f));
    const wallRects = walls.map((w) => wallToOrientedRect(w));
    let checks = 0;
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        orientedRectsOverlap(rects[i], rects[j]);
        checks++;
      }
      for (const wallRect of wallRects) {
        orientedRectsOverlap(rects[i], wallRect);
        checks++;
      }
    }
    const elapsedMs = performance.now() - start;

    expect(checks).toBeGreaterThan(0);
    expect(elapsedMs).toBeLessThan(200);
  });
});
