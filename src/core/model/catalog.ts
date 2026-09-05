// Seed furniture catalog: basic parametric shapes + a small preset library (prd.md §7.3).

import type { FurnitureCatalogItem } from './types';

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Basic shapes
  {
    id: 'basic-rect',
    name: 'Rectangle',
    category: 'basic-shape',
    shape: 'rect',
    defaultWidthMm: 600,
    defaultDepthMm: 600,
    defaultHeightMm: 750,
    defaultColorHex: '#9ca3af',
  },
  {
    id: 'basic-circle',
    name: 'Circle',
    category: 'basic-shape',
    shape: 'circle',
    defaultWidthMm: 600,
    defaultDepthMm: 600,
    defaultHeightMm: 750,
    defaultColorHex: '#9ca3af',
  },
  {
    id: 'basic-lshape',
    name: 'L-Shape',
    category: 'basic-shape',
    shape: 'lshape',
    defaultWidthMm: 900,
    defaultDepthMm: 900,
    defaultHeightMm: 750,
    defaultColorHex: '#9ca3af',
  },

  // Seating
  {
    id: 'sofa-standard',
    name: 'Sofa',
    category: 'seating',
    shape: 'rect',
    defaultWidthMm: 2130,
    defaultDepthMm: 900,
    defaultHeightMm: 850,
    defaultColorHex: '#0072B2',
  },
  {
    id: 'armchair',
    name: 'Armchair',
    category: 'seating',
    shape: 'rect',
    defaultWidthMm: 850,
    defaultDepthMm: 850,
    defaultHeightMm: 850,
    defaultColorHex: '#0072B2',
  },
  {
    id: 'dining-chair',
    name: 'Dining Chair',
    category: 'seating',
    shape: 'rect',
    defaultWidthMm: 450,
    defaultDepthMm: 500,
    defaultHeightMm: 900,
    defaultColorHex: '#0072B2',
  },

  // Sleeping
  {
    id: 'bed-queen',
    name: 'Queen Bed',
    category: 'sleeping',
    shape: 'rect',
    defaultWidthMm: 1520,
    defaultDepthMm: 2030,
    defaultHeightMm: 600,
    defaultColorHex: '#D55E00',
  },
  {
    id: 'bed-twin',
    name: 'Twin Bed',
    category: 'sleeping',
    shape: 'rect',
    defaultWidthMm: 990,
    defaultDepthMm: 1900,
    defaultHeightMm: 600,
    defaultColorHex: '#D55E00',
  },

  // Tables
  {
    id: 'dining-table-rect',
    name: 'Dining Table',
    category: 'tables',
    shape: 'rect',
    defaultWidthMm: 1500,
    defaultDepthMm: 900,
    defaultHeightMm: 750,
    defaultColorHex: '#E69F00',
  },
  {
    id: 'coffee-table-round',
    name: 'Coffee Table (Round)',
    category: 'tables',
    shape: 'circle',
    defaultWidthMm: 900,
    defaultDepthMm: 900,
    defaultHeightMm: 450,
    defaultColorHex: '#E69F00',
  },
  {
    id: 'desk',
    name: 'Desk',
    category: 'tables',
    shape: 'rect',
    defaultWidthMm: 1200,
    defaultDepthMm: 600,
    defaultHeightMm: 750,
    defaultColorHex: '#E69F00',
  },

  // Storage
  {
    id: 'dresser',
    name: 'Dresser',
    category: 'storage',
    shape: 'rect',
    defaultWidthMm: 1200,
    defaultDepthMm: 500,
    defaultHeightMm: 850,
    defaultColorHex: '#009E73',
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'storage',
    shape: 'rect',
    defaultWidthMm: 900,
    defaultDepthMm: 300,
    defaultHeightMm: 1800,
    defaultColorHex: '#009E73',
  },
  {
    id: 'wardrobe-lshape',
    name: 'Corner Wardrobe',
    category: 'storage',
    shape: 'lshape',
    defaultWidthMm: 1200,
    defaultDepthMm: 1200,
    defaultHeightMm: 2000,
    defaultColorHex: '#009E73',
  },

  // Appliances
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'appliance',
    shape: 'rect',
    defaultWidthMm: 900,
    defaultDepthMm: 750,
    defaultHeightMm: 1800,
    defaultColorHex: '#CC79A7',
  },
  {
    id: 'washer-dryer',
    name: 'Washer/Dryer',
    category: 'appliance',
    shape: 'rect',
    defaultWidthMm: 700,
    defaultDepthMm: 700,
    defaultHeightMm: 850,
    defaultColorHex: '#CC79A7',
  },
];

export function getCatalogItem(catalogId: string): FurnitureCatalogItem | undefined {
  return FURNITURE_CATALOG.find((item) => item.id === catalogId);
}
