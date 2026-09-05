// Zustand store holding the active Project, wrapped with undo/redo (zundo).
// All mutation should go through these actions rather than external direct writes,
// so history/undo stays consistent (architect.md §3).

import { create, useStore } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type {
  FurnitureInstance,
  Opening,
  Project,
  ReferenceImage,
  Room,
  UnitSystem,
  Wall,
} from '../core/model/types';
import { createEmptyProject } from '../core/model/factory';

interface ProjectState {
  project: Project;
  setProject: (project: Project) => void;
  renameProject: (name: string) => void;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  addReferenceImage: (image: ReferenceImage) => void;
  updateReferenceImageTransform: (
    id: string,
    changes: Partial<Pick<ReferenceImage, 'offsetMm' | 'rotationDeg' | 'opacity' | 'locked'>>,
  ) => void;
  setReferenceImagePixelsPerMm: (id: string, pixelsPerMm: number) => void;
  removeReferenceImage: (id: string) => void;
  addWalls: (walls: Wall[]) => void;
  updateWall: (id: string, changes: Partial<Pick<Wall, 'thicknessMm' | 'heightMm'>>) => void;
  removeWall: (id: string) => void;
  addOpening: (wallId: string, opening: Opening) => void;
  removeOpening: (wallId: string, openingId: string) => void;
  addRoom: (room: Room) => void;
  renameRoom: (id: string, name: string) => void;
  removeRoom: (id: string) => void;
  addFurniture: (instance: FurnitureInstance) => void;
  updateFurniture: (id: string, changes: Partial<FurnitureInstance>) => void;
  removeFurniture: (id: string) => void;
  duplicateFurniture: (id: string, newId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  temporal(
    immer((set) => ({
      project: createEmptyProject(),

      setProject: (project) =>
        set((state) => {
          state.project = project;
        }),

      renameProject: (name) =>
        set((state) => {
          state.project.name = name;
          state.project.updatedAt = new Date().toISOString();
        }),

      setUnitSystem: (unitSystem) =>
        set((state) => {
          state.project.unitSystem = unitSystem;
          state.project.updatedAt = new Date().toISOString();
        }),

      addReferenceImage: (image) =>
        set((state) => {
          state.project.referenceImages.push(image);
          state.project.updatedAt = new Date().toISOString();
        }),

      updateReferenceImageTransform: (id, changes) =>
        set((state) => {
          const image = state.project.referenceImages.find((img) => img.id === id);
          if (!image) return;
          Object.assign(image, changes);
          state.project.updatedAt = new Date().toISOString();
        }),

      setReferenceImagePixelsPerMm: (id, pixelsPerMm) =>
        set((state) => {
          const image = state.project.referenceImages.find((img) => img.id === id);
          if (!image) return;
          image.pixelsPerMm = pixelsPerMm;
          state.project.updatedAt = new Date().toISOString();
        }),

      removeReferenceImage: (id) =>
        set((state) => {
          state.project.referenceImages = state.project.referenceImages.filter(
            (img) => img.id !== id,
          );
          state.project.updatedAt = new Date().toISOString();
        }),

      addWalls: (walls) =>
        set((state) => {
          state.project.floors[0].walls.push(...walls);
          state.project.updatedAt = new Date().toISOString();
        }),

      updateWall: (id, changes) =>
        set((state) => {
          const wall = state.project.floors[0].walls.find((w) => w.id === id);
          if (!wall) return;
          Object.assign(wall, changes);
          state.project.updatedAt = new Date().toISOString();
        }),

      removeWall: (id) =>
        set((state) => {
          const floor = state.project.floors[0];
          floor.walls = floor.walls.filter((w) => w.id !== id);
          floor.rooms.forEach((room) => {
            room.wallIds = room.wallIds.filter((wallId) => wallId !== id);
          });
          state.project.updatedAt = new Date().toISOString();
        }),

      addOpening: (wallId, opening) =>
        set((state) => {
          const wall = state.project.floors[0].walls.find((w) => w.id === wallId);
          if (!wall) return;
          wall.openings.push(opening);
          state.project.updatedAt = new Date().toISOString();
        }),

      removeOpening: (wallId, openingId) =>
        set((state) => {
          const wall = state.project.floors[0].walls.find((w) => w.id === wallId);
          if (!wall) return;
          wall.openings = wall.openings.filter((o) => o.id !== openingId);
          state.project.updatedAt = new Date().toISOString();
        }),

      addRoom: (room) =>
        set((state) => {
          state.project.floors[0].rooms.push(room);
          state.project.updatedAt = new Date().toISOString();
        }),

      renameRoom: (id, name) =>
        set((state) => {
          const room = state.project.floors[0].rooms.find((r) => r.id === id);
          if (!room) return;
          room.name = name;
          state.project.updatedAt = new Date().toISOString();
        }),

      removeRoom: (id) =>
        set((state) => {
          const floor = state.project.floors[0];
          floor.rooms = floor.rooms.filter((r) => r.id !== id);
          state.project.updatedAt = new Date().toISOString();
        }),

      addFurniture: (instance) =>
        set((state) => {
          state.project.floors[0].furniture.push(instance);
          state.project.updatedAt = new Date().toISOString();
        }),

      updateFurniture: (id, changes) =>
        set((state) => {
          const item = state.project.floors[0].furniture.find((f) => f.id === id);
          if (!item) return;
          Object.assign(item, changes);
          state.project.updatedAt = new Date().toISOString();
        }),

      removeFurniture: (id) =>
        set((state) => {
          const floor = state.project.floors[0];
          floor.furniture = floor.furniture.filter((f) => f.id !== id);
          state.project.updatedAt = new Date().toISOString();
        }),

      duplicateFurniture: (id, newId) =>
        set((state) => {
          const floor = state.project.floors[0];
          const item = floor.furniture.find((f) => f.id === id);
          if (!item) return;
          floor.furniture.push({
            ...item,
            id: newId,
            position: { x: item.position.x + 150, y: item.position.y + 150 },
          });
          state.project.updatedAt = new Date().toISOString();
        }),
    })),
    {
      // Only track the project data in undo/redo history, not transient UI state.
      partialize: (state) => ({ project: state.project }),
    },
  ),
);

export const useProjectTemporalStore = () => useProjectStore.temporal;

/** Reactive hook for undo/redo history state (past/future stack lengths, undo/redo actions). */
export function useProjectTemporal<T>(
  selector: (state: ReturnType<typeof useProjectStore.temporal.getState>) => T,
): T {
  return useStore(useProjectStore.temporal, selector);
}

