import { useMemo, useState } from 'react';
import { FURNITURE_CATALOG } from '../core/model/catalog';
import type { FurnitureCategory } from '../core/model/types';
import { useProjectStore } from '../state/projectStore';
import { formatLength } from '../core/units/length';
import { useUiStore } from '../state/uiStore';

const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  'basic-shape': 'Basic Shapes',
  seating: 'Seating',
  sleeping: 'Sleeping',
  tables: 'Tables',
  storage: 'Storage',
  appliance: 'Appliances',
};

const CATEGORY_ORDER: FurnitureCategory[] = [
  'basic-shape',
  'seating',
  'sleeping',
  'tables',
  'storage',
  'appliance',
];

export function FurniturePalette() {
  const [search, setSearch] = useState('');
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const armedCatalogId = useUiStore((s) => s.armedCatalogId);
  const setArmedCatalogId = useUiStore((s) => s.setArmedCatalogId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q === ''
      ? FURNITURE_CATALOG
      : FURNITURE_CATALOG.filter((item) => item.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <aside className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white md:w-56 md:flex-none md:shrink-0 md:border-r md:border-gray-200">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2">
        <input
          type="text"
          placeholder="Search furniture..."
          aria-label="Search furniture"
          className="w-full rounded border border-gray-300 px-2 py-2 text-base md:py-1 md:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 && (
        <p className="p-3 text-xs text-gray-500">No furniture matches "{search}".</p>
      )}
      {CATEGORY_ORDER.map((category) => {
        const items = filtered.filter((item) => item.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="border-b border-gray-100 p-2">
            <h3 className="mb-1 text-xs font-semibold uppercase text-gray-500">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/roomflow-catalog-id', item.id)}
                  onClick={() =>
                    setArmedCatalogId(armedCatalogId === item.id ? null : item.id)
                  }
                  className={`flex items-center gap-2 rounded border px-2 py-2 text-left text-xs md:py-1 ${
                    armedCatalogId === item.id
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="inline-block h-4 w-4 shrink-0 border border-black/10"
                    style={{
                      backgroundColor: item.defaultColorHex,
                      borderRadius: item.shape === 'circle' ? '9999px' : '2px',
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.name}</span>
                    <span className="block truncate text-[10px] text-gray-400">
                      {formatLength(item.defaultWidthMm, unitSystem)} ×{' '}
                      {formatLength(item.defaultDepthMm, unitSystem)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );

}
