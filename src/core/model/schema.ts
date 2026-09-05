// Zod schemas mirroring core/model/types.ts, used to validate imported project
// files and other runtime-untrusted input (spec.md §8, §9).

import { z } from 'zod';

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const ReferenceImageSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  dataUrl: z.string(),
  naturalWidthPx: z.number().positive(),
  naturalHeightPx: z.number().positive(),
  offsetMm: Point2DSchema,
  rotationDeg: z.number(),
  pixelsPerMm: z.number().positive(),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
});

export const OpeningSchema = z.object({
  id: z.string(),
  type: z.enum(['door', 'window']),
  offsetMm: z.number().min(0),
  widthMm: z.number().positive(),
  swing: z.enum(['left', 'right', 'double', 'none']).optional(),
});

export const WallSchema = z.object({
  id: z.string(),
  start: Point2DSchema,
  end: Point2DSchema,
  thicknessMm: z.number().positive(),
  heightMm: z.number().positive(),
  openings: z.array(OpeningSchema),
});

export const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  wallIds: z.array(z.string()),
  labelPosition: Point2DSchema.optional(),
  computedAreaMm2: z.number().nonnegative().optional(),
});

export const FurnitureShapeSchema = z.enum(['rect', 'circle', 'lshape']);

export const FurnitureInstanceSchema = z.object({
  id: z.string(),
  catalogId: z.string(),
  name: z.string(),
  shape: FurnitureShapeSchema,
  widthMm: z.number().positive().max(20000),
  depthMm: z.number().positive().max(20000),
  heightMm: z.number().positive().max(20000),
  lshapeCutout: z
    .object({ widthMm: z.number().positive(), depthMm: z.number().positive() })
    .optional(),
  position: Point2DSchema,
  rotationDeg: z.number(),
  colorHex: z.string(),
  roomId: z.string().optional(),
});

export const FurnitureCatalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'seating',
    'sleeping',
    'tables',
    'storage',
    'appliance',
    'basic-shape',
  ]),
  shape: FurnitureShapeSchema,
  defaultWidthMm: z.number().positive(),
  defaultDepthMm: z.number().positive(),
  defaultHeightMm: z.number().positive(),
  defaultColorHex: z.string(),
});

export const FloorSchema = z.object({
  id: z.string(),
  name: z.string(),
  rooms: z.array(RoomSchema),
  walls: z.array(WallSchema),
  furniture: z.array(FurnitureInstanceSchema),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  unitSystem: z.enum(['imperial', 'metric']),
  createdAt: z.string(),
  updatedAt: z.string(),
  referenceImages: z.array(ReferenceImageSchema),
  floors: z.array(FloorSchema),
  version: z.number().int().positive(),
});
