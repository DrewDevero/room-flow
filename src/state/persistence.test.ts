import { describe, expect, it } from 'vitest';
import { parseProjectJson } from './persistence';
import { createEmptyProject } from '../core/model/factory';

describe('parseProjectJson', () => {
  it('round-trips a valid project through JSON serialization', () => {
    const project = createEmptyProject('Round Trip Test');
    const json = JSON.stringify(project);
    const result = parseProjectJson(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.project).toEqual(project);
    }
  });

  it('rejects invalid JSON', () => {
    const result = parseProjectJson('not json {{{');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/valid JSON/);
    }
  });

  it('rejects JSON that does not match the project schema', () => {
    const result = parseProjectJson(JSON.stringify({ foo: 'bar' }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/valid RoomFlow project/);
    }
  });

  it('rejects a JSON array (not an object)', () => {
    const result = parseProjectJson(JSON.stringify([1, 2, 3]));
    expect(result.success).toBe(false);
  });
});
