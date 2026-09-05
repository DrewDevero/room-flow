import { describe, expect, it } from 'vitest';
import {
  polygonAreaMm2,
  polygonCentroid,
  projectPointOntoSegment,
  snapToAngle,
  snapToNearbyPoint,
} from './walls';

describe('projectPointOntoSegment', () => {
  it('projects onto the middle of a segment', () => {
    const result = projectPointOntoSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(result.point).toEqual({ x: 5, y: 0 });
    expect(result.t).toBeCloseTo(0.5);
    expect(result.distance).toBeCloseTo(5);
  });

  it('clamps to segment endpoints', () => {
    const result = projectPointOntoSegment({ x: -5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(result.point).toEqual({ x: 0, y: 0 });
    expect(result.t).toBe(0);
  });
});

describe('snapToNearbyPoint', () => {
  it('snaps to a candidate within threshold', () => {
    const result = snapToNearbyPoint({ x: 100, y: 100 }, [{ x: 105, y: 102 }], 20);
    expect(result).toEqual({ x: 105, y: 102 });
  });

  it('does not snap beyond threshold', () => {
    const result = snapToNearbyPoint({ x: 100, y: 100 }, [{ x: 200, y: 200 }], 20);
    expect(result).toEqual({ x: 100, y: 100 });
  });
});

describe('snapToAngle', () => {
  it('snaps a near-horizontal segment to exactly horizontal', () => {
    const result = snapToAngle({ x: 0, y: 0 }, { x: 100, y: 2 }, 15);
    expect(result.y).toBeCloseTo(0);
  });

  it('snaps a 44deg segment to 45deg', () => {
    const origin = { x: 0, y: 0 };
    const point = { x: 100 * Math.cos((44 * Math.PI) / 180), y: 100 * Math.sin((44 * Math.PI) / 180) };
    const result = snapToAngle(origin, point, 15);
    const expectedAngle = Math.round((44 / 15)) * 15;
    expect(expectedAngle).toBe(45);
    expect(result.x).toBeCloseTo(100 * Math.cos((45 * Math.PI) / 180), 1);
    expect(result.y).toBeCloseTo(100 * Math.sin((45 * Math.PI) / 180), 1);
  });
});

describe('polygonAreaMm2', () => {
  it('computes area of a simple rectangle', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 0, y: 50 },
    ];
    expect(polygonAreaMm2(points)).toBeCloseTo(5000);
  });

  it('returns 0 for fewer than 3 points', () => {
    expect(polygonAreaMm2([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0);
  });
});

describe('polygonCentroid', () => {
  it('computes the average of the vertices', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonCentroid(points)).toEqual({ x: 5, y: 5 });
  });
});
