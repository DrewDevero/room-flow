// Export/import to a portable _roomflow.json file, plus localStorage autosave
// (spec.md §8). No backend — this is the sole persistence mechanism for MVP.

import { ProjectSchema } from '../core/model/schema';
import { runMigrations } from '../core/model/migrations';
import type { Project } from '../core/model/types';

const AUTOSAVE_KEY = 'roomflow:autosave';

export function exportProjectToFile(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(project.name)}_roomflow.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function sanitizeFileName(name: string): string {
  const trimmed = name.trim() || 'roomflow-project';
  return trimmed.replace(/[/\\?%*:|"<>]/g, '-');
}

export type ParseProjectResult =
  | { success: true; project: Project }
  | { success: false; error: string };

export function parseProjectJson(json: string): ParseProjectResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { success: false, error: "This file isn't valid JSON." };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { success: false, error: "This file isn't a valid RoomFlow project." };
  }

  const migrated = runMigrations(raw as Record<string, unknown>);
  const result = ProjectSchema.safeParse(migrated);

  if (!result.success) {
    return { success: false, error: "This file isn't a valid RoomFlow project." };
  }

  return { success: true, project: result.data as Project };
}

export function saveProjectToLocalStorage(project: Project): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(project));
  } catch {
    // Storage quota exceeded or unavailable — autosave is best-effort only.
  }
}

export function loadProjectFromLocalStorage(): Project | null {
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) return null;
  const result = parseProjectJson(raw);
  return result.success ? result.project : null;
}

export function clearAutosave(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}
