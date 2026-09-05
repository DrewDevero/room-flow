// Schema version migration chain (spec.md §8). Each entry migrates data from
// its key version to key+1. Empty for now since v1 is the only schema so far.

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  // 1: (data) => ({ ...data, version: 2, /* ...changes */ }),
};

/** Runs any needed migrations, returning data upgraded to the current schema version. */
export function runMigrations(data: Record<string, unknown>): Record<string, unknown> {
  let current = data;
  let version = typeof current.version === 'number' ? current.version : 1;

  while (MIGRATIONS[version]) {
    current = MIGRATIONS[version](current);
    version = typeof current.version === 'number' ? current.version : version + 1;
  }

  return current;
}
