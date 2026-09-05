import { useEffect, useRef } from 'react';
import { useProjectStore, useProjectTemporal } from '../state/projectStore';
import { useUiStore, type EditorTool } from '../state/uiStore';
import { useToastStore } from '../state/toastStore';
import { AddReferenceImageButton } from '../features/floorplan-editor/AddReferenceImageButton';
import { exportProjectToFile, parseProjectJson } from '../state/persistence';

export function Toolbar() {
  const project = useProjectStore((s) => s.project);
  const setProject = useProjectStore((s) => s.setProject);
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
  const showToast = useToastStore((s) => s.showToast);
  const importInputRef = useRef<HTMLInputElement>(null);

  const canUndo = useProjectTemporal((s) => s.pastStates.length > 0);
  const canRedo = useProjectTemporal((s) => s.futureStates.length > 0);
  const undo = useProjectTemporal((s) => s.undo);
  const redo = useProjectTemporal((s) => s.redo);

  const toggleTool = (tool: EditorTool) => setActiveTool(activeTool === tool ? 'select' : tool);

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
    <header className="flex h-12 shrink-0 items-center gap-3 overflow-x-auto border-b border-gray-200 bg-white px-3 text-sm">
      <input
        className="w-48 rounded border border-transparent px-2 py-1 font-medium hover:border-gray-300 focus:border-gray-400 focus:outline focus:outline-2 focus:outline-blue-500"
        value={projectName}
        aria-label="Project name"
        onChange={(e) => renameProject(e.target.value)}
      />
      <div className="flex-1" />
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
      <AddReferenceImageButton />
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
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          file.text().then((text) => {
            const result = parseProjectJson(text);
            if (result.success) {
              setProject(result.project);
              showToast(`Imported "${result.project.name}"`);
            } else {
              showToast(result.error);
            }
          });
        }}
      />
      <button
        type="button"
        className="rounded px-2 py-1 hover:bg-gray-100"
        onClick={() => importInputRef.current?.click()}
      >
        Import
      </button>
      <button
        type="button"
        className="rounded px-2 py-1 hover:bg-gray-100"
        onClick={() => exportProjectToFile(project)}
      >
        Export
      </button>
    </header>
  );
}
