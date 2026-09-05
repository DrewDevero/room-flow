// Core data model shared by the 2D editor, 3D preview, and persistence layers.
// See spec.md §2 for the authoritative definitions these types mirror.

export type UnitSystem = 'imperial' | 'metric';

export interface Point2D {
  x: number;
  y: number;
}

export interface ReferenceImage {
  id: string;
  fileName: string;
  dataUrl: string;
  naturalWidthPx: number;
  naturalHeightPx: number;
  offsetMm: Point2D;
  rotationDeg: number;
  pixelsPerMm: number;
  opacity: number;
  locked: boolean;
}

export type OpeningType = 'door' | 'window';
export type DoorSwing = 'left' | 'right' | 'double' | 'none';

export interface Opening {
  id: string;
  type: OpeningType;
  offsetMm: number;
  widthMm: number;
  swing?: DoorSwing;
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thicknessMm: number;
  heightMm: number;
  openings: Opening[];
}

export interface Room {
  id: string;
  name: string;
  wallIds: string[];
  labelPosition?: Point2D;
  computedAreaMm2?: number;
}

export type FurnitureShape = 'rect' | 'circle' | 'lshape';

export interface FurnitureInstance {
  id: string;
  catalogId: string;
  name: string;
  shape: FurnitureShape;
  widthMm: number;
  depthMm: number;
  heightMm: number;
  lshapeCutout?: { widthMm: number; depthMm: number };
  position: Point2D;
  rotationDeg: number;
  colorHex: string;
  roomId?: string;
}

export type FurnitureCategory =
  | 'seating'
  | 'sleeping'
  | 'tables'
  | 'storage'
  | 'appliance'
  | 'basic-shape';

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  shape: FurnitureShape;
  defaultWidthMm: number;
  defaultDepthMm: number;
  defaultHeightMm: number;
  defaultColorHex: string;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
  walls: Wall[];
  furniture: FurnitureInstance[];
}

export interface Project {
  id: string;
  name: string;
  unitSystem: UnitSystem;
  createdAt: string;
  updatedAt: string;
  referenceImages: ReferenceImage[];
  floors: Floor[];
  version: number;
}

export const CURRENT_PROJECT_SCHEMA_VERSION = 1;
