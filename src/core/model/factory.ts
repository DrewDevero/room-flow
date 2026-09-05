// Factory helpers for creating empty/default project data (spec.md §2).

import { v4 as uuid } from 'uuid';
import { CURRENT_PROJECT_SCHEMA_VERSION, type Floor, type Project } from './types';

export function createEmptyFloor(name = 'Floor 1'): Floor {
  return {
    id: uuid(),
    name,
    rooms: [],
    walls: [],
    furniture: [],
  };
}

export function createEmptyProject(name = 'Untitled Project'): Project {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    name,
    unitSystem: 'imperial',
    createdAt: now,
    updatedAt: now,
    referenceImages: [],
    floors: [createEmptyFloor()],
    version: CURRENT_PROJECT_SCHEMA_VERSION,
  };
}
