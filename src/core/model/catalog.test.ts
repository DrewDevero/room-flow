import { describe, expect, it } from 'vitest';
import { FURNITURE_CATALOG, getFurnitureAssetId } from './catalog';

describe('getFurnitureAssetId', () => {
  it('maps any basic shape with an established furniture name to that asset id', () => {
    const establishedFurniture = FURNITURE_CATALOG.filter(
      (catalogItem) => catalogItem.category !== 'basic-shape',
    );

    for (const catalogItem of establishedFurniture) {
      expect(getFurnitureAssetId({ catalogId: 'basic-rect', name: catalogItem.name })).toBe(catalogItem.id);
      expect(getFurnitureAssetId({ catalogId: 'basic-circle', name: catalogItem.name })).toBe(catalogItem.id);
      expect(getFurnitureAssetId({ catalogId: 'basic-lshape', name: catalogItem.name })).toBe(catalogItem.id);
    }
  });

  it('matches established furniture names case-insensitively and with collapsed spacing', () => {
    expect(getFurnitureAssetId({ catalogId: 'basic-rect', name: '  kitchen   sink ' })).toBe('kitchen-sink');
  });

  it('preserves explicit catalog ids and unknown basic shapes', () => {
    expect(getFurnitureAssetId({ catalogId: 'sofa-standard', name: 'Kitchen Sink' })).toBe('sofa-standard');
    expect(getFurnitureAssetId({ catalogId: 'basic-rect', name: 'Custom Block' })).toBe('basic-rect');
  });

  it('supports common aliases for established furniture names', () => {
    expect(getFurnitureAssetId({ catalogId: 'basic-rect', name: 'Dishwasher' })).toBe('dish-washer');
    expect(getFurnitureAssetId({ catalogId: 'basic-rect', name: 'Coffee Table' })).toBe('coffee-table-round');
  });
});