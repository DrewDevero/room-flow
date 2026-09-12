import { useRef, useState } from 'react';
import { useProjectStore } from '../state/projectStore';
import { useUiStore } from '../state/uiStore';
import { formatArea, formatLength, parseLength } from '../core/units/length';
import { polygonAreaMm2, resolveRoomPolygon } from '../core/geometry/walls';
import { v4 as uuid } from 'uuid';
import type { UnitSystem } from '../core/model/types';

export function InspectorPanel() {
  const selection = useUiStore((s) => s.selection);

  return (
    <aside className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-white p-3 text-sm md:w-72 md:flex-none md:shrink-0 md:border-l md:border-gray-200">
      <h3 className="mb-2 hidden text-xs font-semibold uppercase text-gray-500 md:block">Inspector</h3>

      {selection?.type === 'referenceImage' && <ReferenceImageInspector id={selection.id} />}
      {selection?.type === 'wall' && <WallInspector id={selection.id} />}
      {selection?.type === 'room' && <RoomInspector id={selection.id} />}
      {selection?.type === 'furniture' && <FurnitureInspector id={selection.id} />}
      {!selection && <NoSelectionSummary />}
    </aside>
  );
}

function NoSelectionSummary() {
  const rooms = useProjectStore((s) => s.project.floors[0].rooms);
  const walls = useProjectStore((s) => s.project.floors[0].walls);
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const setSelection = useUiStore((s) => s.setSelection);

  if (rooms.length === 0) {
    return (
      <p className="text-xs text-gray-500">Select a wall, room, or furniture item to edit it.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase text-gray-500">Rooms</p>
      {rooms.map((room) => {
        const points = resolveRoomPolygon(room, walls);
        const areaMm2 = polygonAreaMm2(points);
        return (
          <button
            key={room.id}
            type="button"
            className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-left text-xs hover:bg-gray-50"
            onClick={() => setSelection({ type: 'room', id: room.id })}
          >
            <span>{room.name}</span>
            <span className="text-gray-500">{formatArea(areaMm2, unitSystem)}</span>
          </button>
        );
      })}
    </div>
  );
}

function ReferenceImageInspector({ id }: { id: string }) {
  const referenceImages = useProjectStore((s) => s.project.referenceImages);
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const updateReferenceImageTransform = useProjectStore((s) => s.updateReferenceImageTransform);
  const removeReferenceImage = useProjectStore((s) => s.removeReferenceImage);
  const setActiveTool = useUiStore((s) => s.setActiveTool);
  const setSelection = useUiStore((s) => s.setSelection);

  const image = referenceImages.find((img) => img.id === id);
  if (!image) return null;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">Reference Image</p>
        <p className="truncate text-xs text-gray-500">{image.fileName}</p>
      </div>

      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Opacity
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={image.opacity}
          onChange={(e) => updateReferenceImageTransform(id, { opacity: Number(e.target.value) })}
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-600">
        <input
          type="checkbox"
          checked={image.locked}
          onChange={(e) => updateReferenceImageTransform(id, { locked: e.target.checked })}
        />
        Lock position
      </label>

      <div className="text-xs text-gray-500">
        Scale: {formatLength(image.naturalWidthPx / image.pixelsPerMm, unitSystem)} wide
      </div>

      <button
        type="button"
        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
        onClick={() => setActiveTool('calibrate')}
      >
        Recalibrate
      </button>

      <button
        type="button"
        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        onClick={() => {
          removeReferenceImage(id);
          setSelection(null);
        }}
      >
        Remove Image
      </button>
    </div>
  );
}

function WallInspector({ id }: { id: string }) {
  const walls = useProjectStore((s) => s.project.floors[0].walls);
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const updateWall = useProjectStore((s) => s.updateWall);
  const removeWall = useProjectStore((s) => s.removeWall);
  const removeOpening = useProjectStore((s) => s.removeOpening);
  const setSelection = useUiStore((s) => s.setSelection);

  const wall = walls.find((w) => w.id === id);
  if (!wall) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase text-gray-500">Wall</p>

      <LengthField
        label="Thickness"
        valueMm={wall.thicknessMm}
        unitSystem={unitSystem}
        onChange={(mm) => updateWall(id, { thicknessMm: mm })}
      />
      <LengthField
        label="Height"
        valueMm={wall.heightMm}
        unitSystem={unitSystem}
        onChange={(mm) => updateWall(id, { heightMm: mm })}
      />

      {wall.openings.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Openings</p>
          <ul className="flex flex-col gap-1">
            {wall.openings.map((opening) => (
              <li
                key={opening.id}
                className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs"
              >
                <span>
                  {opening.type} — {formatLength(opening.widthMm, unitSystem)}
                </span>
                <button
                  type="button"
                  className="text-red-600 hover:underline"
                  onClick={() => removeOpening(wall.id, opening.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        onClick={() => {
          removeWall(id);
          setSelection(null);
        }}
      >
        Delete Wall
      </button>
    </div>
  );
}

function RoomInspector({ id }: { id: string }) {
  const rooms = useProjectStore((s) => s.project.floors[0].rooms);
  const walls = useProjectStore((s) => s.project.floors[0].walls);
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const renameRoom = useProjectStore((s) => s.renameRoom);
  const removeRoom = useProjectStore((s) => s.removeRoom);
  const setSelection = useUiStore((s) => s.setSelection);

  const room = rooms.find((r) => r.id === id);
  if (!room) return null;

  const points = resolveRoomPolygon(room, walls);
  const areaMm2 = polygonAreaMm2(points);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase text-gray-500">Room</p>

      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Name
        <input
          type="text"
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={room.name}
          onChange={(e) => renameRoom(id, e.target.value)}
        />
      </label>

      <p className="text-xs text-gray-500">Area: {formatArea(areaMm2, unitSystem)}</p>

      <button
        type="button"
        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        onClick={() => {
          removeRoom(id);
          setSelection(null);
        }}
      >
        Delete Room
      </button>
    </div>
  );
}

function FurnitureInspector({ id }: { id: string }) {
  const furniture = useProjectStore((s) => s.project.floors[0].furniture);
  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const updateFurniture = useProjectStore((s) => s.updateFurniture);
  const removeFurniture = useProjectStore((s) => s.removeFurniture);
  const duplicateFurniture = useProjectStore((s) => s.duplicateFurniture);
  const setSelection = useUiStore((s) => s.setSelection);

  const item = furniture.find((f) => f.id === id);
  if (!item) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase text-gray-500">Furniture ({item.shape})</p>

      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Name
        <input
          type="text"
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={item.name}
          onChange={(e) => updateFurniture(id, { name: e.target.value })}
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <LengthField
          label="Width"
          valueMm={item.widthMm}
          unitSystem={unitSystem}
          onChange={(mm) => updateFurniture(id, { widthMm: mm })}
        />
        <LengthField
          label="Depth"
          valueMm={item.depthMm}
          unitSystem={unitSystem}
          onChange={(mm) => updateFurniture(id, { depthMm: mm })}
        />
      </div>
      <LengthField
        label="Height"
        valueMm={item.heightMm}
        unitSystem={unitSystem}
        onChange={(mm) => updateFurniture(id, { heightMm: mm })}
      />

      <div className="grid grid-cols-2 gap-2">
        <LengthField
          label="Position X"
          valueMm={item.position.x}
          unitSystem={unitSystem}
          onChange={(mm) => updateFurniture(id, { position: { ...item.position, x: mm } })}
        />
        <LengthField
          label="Position Y"
          valueMm={item.position.y}
          unitSystem={unitSystem}
          onChange={(mm) => updateFurniture(id, { position: { ...item.position, y: mm } })}
        />
      </div>

      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Rotation (degrees)
        <input
          type="number"
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          value={Math.round(item.rotationDeg)}
          onChange={(e) => updateFurniture(id, { rotationDeg: Number(e.target.value) })}
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-600">
        Color
        <input
          type="color"
          className="h-6 w-10 rounded border border-gray-300"
          value={item.colorHex}
          onChange={(e) => updateFurniture(id, { colorHex: e.target.value })}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
          onClick={() => {
            const newId = uuid();
            duplicateFurniture(id, newId);
            setSelection({ type: 'furniture', id: newId });
          }}
        >
          Duplicate
        </button>
        <button
          type="button"
          className="flex-1 rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          onClick={() => {
            removeFurniture(id);
            setSelection(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function LengthField({
  label,
  valueMm,
  unitSystem,
  onChange,
}: {
  label: string;
  valueMm: number;
  unitSystem: UnitSystem;
  onChange: (mm: number) => void;
}) {
  const displayValue = formatLength(valueMm, unitSystem);

  return (
    <label className="flex flex-col gap-1 text-xs text-gray-600">
      {label}
      <LengthInput
        key={`${unitSystem}:${valueMm}`}
        displayValue={displayValue}
        valueMm={valueMm}
        unitSystem={unitSystem}
        onChange={onChange}
      />
    </label>
  );
}

function LengthInput({
  displayValue,
  valueMm,
  unitSystem,
  onChange,
}: {
  displayValue: string;
  valueMm: number;
  unitSystem: UnitSystem;
  onChange: (mm: number) => void;
}) {
  const [draft, setDraft] = useState(displayValue);
  const skipNextBlurCommit = useRef(false);

  const reset = () => setDraft(formatLength(valueMm, unitSystem));

  const commit = (inputValue: string) => {
    const parsed = parseLength(inputValue, unitSystem);
    if (parsed !== null && parsed > 0) {
      onChange(parsed);
      setDraft(formatLength(parsed, unitSystem));
      return;
    }
    reset();
  };

  return (
    <input
      type="text"
      className="rounded border border-gray-300 px-2 py-1 text-sm"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => {
        if (skipNextBlurCommit.current) {
          skipNextBlurCommit.current = false;
          return;
        }
        commit(e.currentTarget.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit(e.currentTarget.value);
          skipNextBlurCommit.current = true;
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          reset();
          skipNextBlurCommit.current = true;
          e.currentTarget.blur();
        }
      }}
    />
  );
}

