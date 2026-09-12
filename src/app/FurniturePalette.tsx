import { useMemo, useState } from 'react';
import { FURNITURE_CATALOG } from '../core/model/catalog';
import type { FurnitureCatalogItem, FurnitureCategory } from '../core/model/types';
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
                  <FurnitureThumbnail item={item} />
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

function FurnitureThumbnail({ item }: { item: FurnitureCatalogItem }) {
  const color = item.defaultColorHex;
  const line = 'rgba(255,255,255,0.82)';
  const dark = 'rgba(0,0,0,0.28)';

  if (item.shape === 'circle') {
    return (
      <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="12" rx="9" ry="9" fill={color} stroke="rgba(0,0,0,0.18)" />
        <ellipse cx="12" cy="12" rx="5.5" ry="5.5" fill="none" stroke={line} />
        {item.id === 'coffee-table-round' && <line x1="7" y1="12" x2="17" y2="12" stroke={line} />}
      </svg>
    );
  }

  if (item.shape === 'lshape') {
    return (
      <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4H13V11H20V20H4Z" fill={color} stroke="rgba(0,0,0,0.18)" />
        <path d="M12 4V12H20" fill="none" stroke={line} />
      </svg>
    );
  }

  switch (item.id) {
    case 'sofa-standard':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="3" y="5" width="18" height="4" fill="rgba(0,0,0,0.16)" />
          <rect x="3" y="5" width="3" height="14" fill="rgba(0,0,0,0.14)" />
          <rect x="18" y="5" width="3" height="14" fill="rgba(0,0,0,0.14)" />
          <line x1="10" y1="10" x2="10" y2="18" stroke={line} />
          <line x1="14" y1="10" x2="14" y2="18" stroke={line} />
        </svg>
      );
    case 'armchair':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="2" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="4" width="14" height="4" fill="rgba(0,0,0,0.16)" />
          <rect x="5" y="4" width="3.5" height="16" fill="rgba(0,0,0,0.14)" />
          <rect x="15.5" y="4" width="3.5" height="16" fill="rgba(0,0,0,0.14)" />
          <rect x="9" y="10" width="6" height="7" rx="1" fill="rgba(255,255,255,0.18)" />
        </svg>
      );
    case 'dining-chair':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="4" width="12" height="4" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="6" y="11" width="12" height="9" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <path d="M8 8V11H16V8" fill="none" stroke={dark} />
        </svg>
      );
    case 'bed-queen':
    case 'bed-twin':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="2.5" width="14" height="19" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="2.5" width="14" height="3" fill="rgba(0,0,0,0.2)" />
          <rect x="6.5" y="6.5" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.42)" />
          <rect x="12.5" y="6.5" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.42)" />
          <line x1="6.5" y1="12" x2="17.5" y2="12" stroke={line} />
        </svg>
      );
    case 'dining-table-rect':
    case 'desk':
    case 'work-desk':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="8" width="14" height="8" fill="rgba(255,255,255,0.16)" stroke={line} />
          {(item.id === 'desk' || item.id === 'work-desk') && <rect x="14" y="8" width="4" height="8" fill="rgba(0,0,0,0.12)" />}
          {item.id === 'work-desk' && <rect x="6" y="8" width="5" height="3" fill="rgba(255,255,255,0.32)" stroke={line} />}
        </svg>
      );
    case 'dresser':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <line x1="3" y1="9" x2="21" y2="9" stroke={line} />
          <line x1="3" y1="12" x2="21" y2="12" stroke={line} />
          <line x1="3" y1="15" x2="21" y2="15" stroke={line} />
          <line x1="10" y1="10.5" x2="14" y2="10.5" stroke={dark} />
          <line x1="10" y1="13.5" x2="14" y2="13.5" stroke={dark} />
        </svg>
      );
    case 'bookshelf':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" fill={color} stroke="rgba(0,0,0,0.18)" />
          {[7, 11, 15, 19].map((y) => <line key={y} x1="5" y1={y} x2="19" y2={y} stroke={line} />)}
          <line x1="12" y1="3" x2="12" y2="21" stroke="rgba(0,0,0,0.14)" />
        </svg>
      );
    case 'refrigerator':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <line x1="12.5" y1="3" x2="12.5" y2="21" stroke={line} />
          <line x1="10.5" y1="7" x2="10.5" y2="17" stroke={dark} strokeWidth="1.4" />
          <line x1="14.5" y1="7" x2="14.5" y2="17" stroke={dark} strokeWidth="1.4" />
        </svg>
      );
    case 'washer-dryer':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="4" width="14" height="3" fill="rgba(255,255,255,0.16)" />
          <circle cx="12" cy="13" r="4.5" fill="rgba(255,255,255,0.22)" stroke={line} />
          <circle cx="12" cy="13" r="2.7" fill="none" stroke={dark} />
        </svg>
      );
    case 'dish-washer':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="4" width="14" height="3" fill="rgba(255,255,255,0.16)" />
          <line x1="8" y1="12" x2="16" y2="12" stroke={line} />
          <line x1="8" y1="16" x2="16" y2="16" stroke={line} />
          <line x1="8" y1="6" x2="16" y2="6" stroke={dark} />
        </svg>
      );
    case 'stove':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <rect x="5" y="4" width="14" height="3" fill="rgba(255,255,255,0.16)" />
          {[9, 15].map((cx) => [11, 16].map((cy) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="none" stroke={dark} />))}
        </svg>
      );
    case 'kitchen-sink':
    case 'bathroom-sink':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <ellipse cx="12" cy="13" rx="5" ry="4" fill="rgba(255,255,255,0.22)" stroke={line} />
          <ellipse cx="12" cy="13" rx="3" ry="2" fill="none" stroke={dark} />
          <path d="M12 8V10H14" fill="none" stroke={dark} strokeWidth="1.4" />
        </svg>
      );
    case 'toilet':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="4" width="8" height="5" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <ellipse cx="12" cy="15" rx="5" ry="5.5" fill={color} stroke="rgba(0,0,0,0.18)" />
          <ellipse cx="12" cy="15" rx="3" ry="3" fill="rgba(255,255,255,0.22)" stroke={line} />
        </svg>
      );
    case 'shower':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="1" fill={color} stroke="rgba(0,0,0,0.18)" />
          <line x1="3" y1="6" x2="21" y2="18" stroke={line} />
          <line x1="21" y1="6" x2="3" y2="18" stroke={line} />
          <ellipse cx="6" cy="9" rx="1.5" ry="2" fill="rgba(255,255,255,0.28)" stroke={dark} />
        </svg>
      );
    case 'closet':
      return (
        <svg className="h-5 w-5 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" fill={color} stroke="rgba(0,0,0,0.18)" />
          <line x1="12" y1="3" x2="12" y2="21" stroke={line} />
          <line x1="9" y1="7" x2="9" y2="17" stroke="rgba(0,0,0,0.14)" />
          <line x1="15" y1="7" x2="15" y2="17" stroke="rgba(0,0,0,0.14)" />
          <line x1="10.5" y1="12" x2="11.5" y2="12" stroke={dark} />
          <line x1="12.5" y1="12" x2="13.5" y2="12" stroke={dark} />
        </svg>
      );
    default:
      return (
        <span
          className="inline-block h-5 w-5 shrink-0 border border-black/10"
          style={{ backgroundColor: color, borderRadius: '2px' }}
        />
      );
  }
}
