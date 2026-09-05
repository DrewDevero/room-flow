import { describe, expect, it } from 'vitest';
import { clampOpeningOffset, findNearestWall, wallLength } from './openings';
import type { Wall } from '../model/types';

function makeWall(id: string, start: { x: number; y: number }, end: { x: number; y: number }): Wall {
  return { id, start, end, thicknessMm: 100, heightMm: 2440, openings: [] };
}

describe('wallLength', () => {
  it('computes the length of a wall segment', () => {
    expect(wallLength(makeWall('w1', { x: 0, y: 0 }, { x: 100, y: 0 }))).toBe(100);
  });
});

describe('findNearestWall', () => {
  it('finds the closest wall within threshold', () => {
    const walls = [
      makeWall('w1', { x: 0, y: 0 }, { x: 1000, y: 0 }),
      makeWall('w2', { x: 0, y: 500 }, { x: 1000, y: 500 }),
    ];
    const hit = findNearestWall({ x: 300, y: 10 }, walls, 50);
    expect(hit?.wall.id).toBe('w1');
    expect(hit?.offsetMm).toBeCloseTo(300);
  });

  it('returns null when nothing is within threshold', () => {
    const walls = [makeWall('w1', { x: 0, y: 0 }, { x: 1000, y: 0 })];
    expect(findNearestWall({ x: 300, y: 500 }, walls, 50)).toBeNull();
  });
});

describe('clampOpeningOffset', () => {
  it('centers the opening when there is enough room', () => {
    expect(clampOpeningOffset(500, 100, 1000)).toBe(450);
  });

  it('clamps to the start of the wall', () => {
    expect(clampOpeningOffset(20, 100, 1000)).toBe(0);
  });

  it('clamps to the end of the wall', () => {
    expect(clampOpeningOffset(980, 100, 1000)).toBe(900);
  });
});
