// Transient editor/view UI state — deliberately separate from projectStore so
// it is not part of undo/redo history or persisted project data.

import { create } from 'zustand';

export type EditorTool =
  | 'select'
  | 'calibrate'
  | 'wall'
  | 'opening-door'
  | 'opening-window'
  | 'map-floor';

export type ViewMode = '2d' | '3d';

export type Selection =
  | { type: 'referenceImage'; id: string }
  | { type: 'wall'; id: string }
  | { type: 'room'; id: string }
  | { type: 'furniture'; id: string }
  | null;

interface UiState {
  viewMode: ViewMode;
  setViewMode: (viewMode: ViewMode) => void;

  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;

  zoom: number; // screen pixels per mm
  setZoom: (zoom: number) => void;

  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;

  selection: Selection;
  setSelection: (selection: Selection) => void;

  armedCatalogId: string | null;
  setArmedCatalogId: (catalogId: string | null) => void;

  // Incremented by the toolbar to ask the canvas to finish the in-progress
  // room-mapping trace (since the drawing state itself lives in the canvas).
  finishMappingRequestId: number;
  requestFinishMapping: () => void;

  // Incremented to ask the selected 2D/3D view to export a snapshot image of itself.
  exportImageRequestId: number;
  exportImageViewMode: ViewMode | null;
  requestExportImage: (viewMode: ViewMode) => void;
  consumeExportImageRequest: (requestId: number) => void;
}

const DEFAULT_ZOOM = 0.15; // ~150 screen px per meter, a reasonable initial fit

export const useUiStore = create<UiState>()((set) => ({
  viewMode: '2d',
  setViewMode: (viewMode) => set({ viewMode }),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  zoom: DEFAULT_ZOOM,
  setZoom: (zoom) => set({ zoom }),

  snapEnabled: true,
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),

  selection: null,
  setSelection: (selection) => set({ selection }),

  armedCatalogId: null,
  setArmedCatalogId: (catalogId) => set({ armedCatalogId: catalogId }),

  finishMappingRequestId: 0,
  requestFinishMapping: () => set((s) => ({ finishMappingRequestId: s.finishMappingRequestId + 1 })),

  exportImageRequestId: 0,
  exportImageViewMode: null,
  requestExportImage: (viewMode) =>
    set((s) => ({
      viewMode,
      exportImageViewMode: viewMode,
      exportImageRequestId: s.exportImageRequestId + 1,
    })),
  consumeExportImageRequest: (requestId) =>
    set((s) =>
      s.exportImageRequestId === requestId
        ? { exportImageViewMode: null }
        : {},
    ),
}));
