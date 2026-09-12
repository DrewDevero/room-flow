import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useProjectStore, useProjectTemporal } from '../state/projectStore';
import { useUiStore, type EditorTool } from '../state/uiStore';
import { importProjectFile, importReferenceImageFile } from '../state/fileIntake';
import { exportProjectToFile } from '../state/persistence';

type ToolbarMenu = 'import' | 'export';

interface MenuPosition {
  left: number;
  top: number;
  width: number;
}

export function Toolbar() {
  const [openMenu, setOpenMenu] = useState<ToolbarMenu | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const project = useProjectStore((s) => s.project);
  const projectName = project.name;
  const unitSystem = project.unitSystem;
  const renameProject = useProjectStore((s) => s.renameProject);
  const setUnitSystem = useProjectStore((s) => s.setUnitSystem);
  const referenceImages = useProjectStore((s) => s.project.referenceImages);
  const activeTool = useUiStore((s) => s.activeTool);
  const setActiveTool = useUiStore((s) => s.setActiveTool);
  const snapEnabled = useUiStore((s) => s.snapEnabled);
  const setSnapEnabled = useUiStore((s) => s.setSnapEnabled);
  const requestFinishMapping = useUiStore((s) => s.requestFinishMapping);
  const requestExportImage = useUiStore((s) => s.requestExportImage);
  const projectImportInputRef = useRef<HTMLInputElement>(null);
  const referenceImageInputRef = useRef<HTMLInputElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  const canUndo = useProjectTemporal((s) => s.pastStates.length > 0);
  const canRedo = useProjectTemporal((s) => s.futureStates.length > 0);
  const undo = useProjectTemporal((s) => s.undo);
  const redo = useProjectTemporal((s) => s.redo);

  const toggleTool = (tool: EditorTool) => setActiveTool(activeTool === tool ? 'select' : tool);

  const toggleMenu = (menu: ToolbarMenu, button: HTMLButtonElement | null, width: number) => {
    if (openMenu === menu) {
      setOpenMenu(null);
      setMenuPosition(null);
      return;
    }
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      left: Math.max(8, rect.right - width),
      top: rect.bottom + 4,
      width,
    });
    setOpenMenu(menu);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (isEditingText) return;

      const isModifierPressed = e.metaKey || e.ctrlKey;
      if (!isModifierPressed || e.key.toLowerCase() !== 'z') return;

      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <>
    <header className="relative z-50 flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white px-2 text-sm sm:gap-3 sm:px-3 [&>*]:shrink-0">
      <input
        className="w-28 rounded border border-transparent px-2 py-1 font-medium hover:border-gray-300 focus:border-gray-400 focus:outline focus:outline-2 focus:outline-blue-500 sm:w-48"
        value={projectName}
        aria-label="Project name"
        onChange={(e) => renameProject(e.target.value)}
      />
      <div className="hidden flex-1 xl:block" />
      <button
        type="button"
        className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
        disabled={!canUndo}
        onClick={() => undo()}
      >
        Undo
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
        disabled={!canRedo}
        onClick={() => redo()}
      >
        Redo
      </button>
      <div className="mx-2 h-5 w-px bg-gray-200" />
      <div className="flex rounded border border-gray-300 text-xs">
        <button
          type="button"
          className={`px-2 py-1 ${unitSystem === 'imperial' ? 'bg-gray-900 text-white' : ''}`}
          onClick={() => setUnitSystem('imperial')}
        >
          ft-in
        </button>
        <button
          type="button"
          className={`px-2 py-1 ${unitSystem === 'metric' ? 'bg-gray-900 text-white' : ''}`}
          onClick={() => setUnitSystem('metric')}
        >
          metric
        </button>
      </div>
      <div className="mx-2 h-5 w-px bg-gray-200" />
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          activeTool === 'map-floor' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
        }`}
        onClick={() => {
          if (activeTool === 'map-floor') {
            requestFinishMapping();
            setActiveTool('select');
          } else {
            setActiveTool('map-floor');
          }
        }}
      >
        {activeTool === 'map-floor' ? 'Finish Mapping' : 'Map Floor'}
      </button>
      <div className="mx-2 h-5 w-px bg-gray-200" />
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          activeTool === 'wall' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
        }`}
        onClick={() => toggleTool('wall')}
      >
        Wall
      </button>
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          activeTool === 'opening-door' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
        }`}
        onClick={() => toggleTool('opening-door')}
      >
        Door
      </button>
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          activeTool === 'opening-window' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
        }`}
        onClick={() => toggleTool('opening-window')}
      >
        Window
      </button>
      <label className="flex items-center gap-1 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={snapEnabled}
          onChange={(e) => setSnapEnabled(e.target.checked)}
        />
        Snap
      </label>
      <div className="mx-2 h-5 w-px bg-gray-200" />
      <button
        type="button"
        className={`rounded px-2 py-1 ${
          activeTool === 'calibrate' ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
        }`}
        disabled={referenceImages.length === 0}
        onClick={() => toggleTool('calibrate')}
      >
        Calibrate
      </button>
      <div className="mx-2 h-5 w-px bg-gray-200" />
      <input
        ref={projectImportInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          void importProjectFile(file);
        }}
      />
      <input
        ref={referenceImageInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          void importReferenceImageFile(file);
        }}
      />
      <div className="relative">
        <button
          ref={importButtonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === 'import'}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
          onClick={() => toggleMenu('import', importButtonRef.current, 176)}
        >
          Import
        </button>
      </div>
      <div className="relative">
        <button
          ref={exportButtonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === 'export'}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50"
          onClick={() => toggleMenu('export', exportButtonRef.current, 160)}
        >
          Export
        </button>
      </div>
    </header>
    {openMenu && menuPosition &&
      createPortal(
        <div
          className="fixed z-[100] flex flex-col rounded border border-gray-200 bg-white py-1 text-left text-xs shadow-lg"
          role="menu"
          style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
        >
          {openMenu === 'import' ? (
            <>
              <button
                type="button"
                className="px-3 py-2 text-left hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuPosition(null);
                  projectImportInputRef.current?.click();
                }}
              >
                Project File (.json)
              </button>
              <button
                type="button"
                className="px-3 py-2 text-left hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuPosition(null);
                  referenceImageInputRef.current?.click();
                }}
              >
                Reference Image
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="px-3 py-2 text-left hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuPosition(null);
                  exportProjectToFile(project);
                }}
              >
                Project File
              </button>
              <button
                type="button"
                className="px-3 py-2 text-left hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuPosition(null);
                  requestExportImage('2d');
                }}
              >
                Save 2D Image
              </button>
              <button
                type="button"
                className="px-3 py-2 text-left hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  setMenuPosition(null);
                  requestExportImage('3d');
                }}
              >
                Save 3D Image
              </button>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
