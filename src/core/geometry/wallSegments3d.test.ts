import { describe, expect, it } from 'vitest';
import { buildWallSegments3D } from './wallSegments3d';
import type { Wall } from '../model/types';

function makeWall(openings: Wall['openings'] = []): Wall {
  return {
    id: 'w1',
    start: { x: 0, y: 0 },
    end: { x: 4000, y: 0 },
    thicknessMm: 100,
    heightMm: 2440,
    openings,
  };
}

describe('buildWallSegments3D', () => {
  it('returns a single full-length solid segment for a wall with no openings', () => {
    const segments = buildWallSegments3D(makeWall());
    expect(segments).toEqual([
      { offsetStartMm: 0, offsetEndMm: 4000, bottomMm: 0, topMm: 2440, material: 'wall' },
    ]);
  });

  it('leaves a full-height gap below door height and adds a header above it', () => {
    const wall = makeWall([
      { id: 'd1', type: 'door', offsetMm: 1000, widthMm: 900, swing: 'left' },
    ]);
    const segments = buildWallSegments3D(wall);

    // solid before the door, header above the door, solid after the door — no
    // segment spans the door's open gap (0 to door height).
    expect(segments).toEqual([
      { offsetStartMm: 0, offsetEndMm: 1000, bottomMm: 0, topMm: 2440, material: 'wall' },
      { offsetStartMm: 1000, offsetEndMm: 1900, bottomMm: 2030, topMm: 2440, material: 'wall' },
      { offsetStartMm: 1900, offsetEndMm: 4000, bottomMm: 0, topMm: 2440, material: 'wall' },
    ]);
  });

  it('adds a glazed segment between sill and header for a window', () => {
    const wall = makeWall([{ id: 'win1', type: 'window', offsetMm: 500, widthMm: 1000 }]);
    const segments = buildWallSegments3D(wall);

    expect(segments).toContainEqual({
      offsetStartMm: 500,
      offsetEndMm: 1500,
      bottomMm: 900,
      topMm: 2100,
      material: 'glass',
    });
    // sill (below) and header (above) solid segments should also exist.
    expect(segments).toContainEqual({
      offsetStartMm: 500,
      offsetEndMm: 1500,
      bottomMm: 0,
      topMm: 900,
      material: 'wall',
    });
    expect(segments).toContainEqual({
      offsetStartMm: 500,
      offsetEndMm: 1500,
      bottomMm: 2100,
      topMm: 2440,
      material: 'wall',
    });
  });
});
