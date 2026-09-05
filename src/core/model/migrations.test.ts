import { describe, expect, it } from 'vitest';
import { runMigrations } from './migrations';

describe('runMigrations', () => {
  it('returns v1 data unchanged (no migrations registered yet)', () => {
    const data = { version: 1, name: 'Test' };
    expect(runMigrations(data)).toEqual(data);
  });

  it('defaults to version 1 when version is missing', () => {
    const data = { name: 'Test' };
    expect(runMigrations(data)).toEqual(data);
  });
});
