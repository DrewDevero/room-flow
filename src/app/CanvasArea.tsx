import { lazy, Suspense, useState } from 'react';
import { FloorPlanCanvas } from '../features/floorplan-editor/FloorPlanCanvas';
import { useUiStore } from '../state/uiStore';

const Scene3D = lazy(() => import('../features/preview-3d/Scene3D').then((m) => ({ default: m.Scene3D })));

type ViewMode = '2d' | '3d';

export function CanvasArea() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const requestExportImage = useUiStore((s) => s.requestExportImage);

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <div className="flex h-9 shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-2">
        <button
          type="button"
          className={`rounded px-3 py-1 text-xs font-medium ${
            viewMode === '2d' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => setViewMode('2d')}
        >
          2D
        </button>
        <button
          type="button"
          className={`rounded px-3 py-1 text-xs font-medium ${
            viewMode === '3d' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
          }`}
          onClick={() => setViewMode('3d')}
        >
          3D
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="rounded px-3 py-1 text-xs font-medium hover:bg-gray-100"
          onClick={requestExportImage}
        >
          <span className="hidden sm:inline">Save {viewMode.toUpperCase()} as Image</span>
          <span className="sm:hidden">Save Image</span>
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {viewMode === '2d' ? (
          <FloorPlanCanvas />
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Loading 3D preview…
              </div>
            }
          >
            <Scene3D />
          </Suspense>
        )}
      </div>
    </main>
  );
}
