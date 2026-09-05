import { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Layer, Line, Stage, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { v4 as uuid } from 'uuid';
import type Konva from 'konva';
import { useProjectStore } from '../../state/projectStore';
import { useUiStore } from '../../state/uiStore';
import { computeGridLines } from '../../core/geometry/grid';
import { computeRecalibratedPixelsPerMm } from '../../core/geometry/calibration';
import { distance, resolveRoomPolygon, snapToAngle, snapToNearbyPoint } from '../../core/geometry/walls';
import { clampOpeningOffset, findNearestWall } from '../../core/geometry/openings';
import {
  furnitureToOrientedRect,
  orientedRectsOverlap,
  wallToOrientedRect,
} from '../../core/geometry/overlap';
import { getCatalogItem } from '../../core/model/catalog';
import { loadSampleReferenceImage, type SampleFloorPlanType } from '../../state/sampleProject';
import { sanitizeFileName } from '../../state/persistence';
import { downloadDataUrl } from '../../state/imageExport';
import type { Point2D, ReferenceImage, Room, Wall } from '../../core/model/types';
import { CalibrationModal } from './CalibrationModal';
import { WallsLayer } from './WallsLayer';
import { RoomLabels } from './RoomLabels';
import { RoomNamePrompt } from './RoomNamePrompt';
import { FurnitureLayer } from './FurnitureLayer';
import { SampleFloorPlanModal } from './SampleFloorPlanModal';

const MIN_ZOOM = 0.01;
const MAX_ZOOM = 2;
const DEFAULT_WALL_THICKNESS_MM = 100;
const DEFAULT_WALL_HEIGHT_MM = 2440;
const DEFAULT_DOOR_WIDTH_MM = 900;
const DEFAULT_WINDOW_WIDTH_MM = 1000;
const OPENING_SNAP_MAX_DISTANCE_MM = 300;
const CATALOG_DND_MIME = 'text/roomflow-catalog-id';

// Clips the reference-image layer to the union of all mapped room polygons,
// so once rooms are traced, only the blueprint area "inside" them stays visible.
function drawRoomsClipPath(ctx: Konva.Context, rooms: Room[], walls: Wall[]) {
  for (const room of rooms) {
    const points = resolveRoomPolygon(room, walls);
    if (points.length < 3) continue;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
  }
}

export function FloorPlanCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pan, setPan] = useState<Point2D>({ x: 0, y: 0 });
  const [calibrationPoints, setCalibrationPoints] = useState<{
    a: Point2D | null;
    b: Point2D | null;
  }>({ a: null, b: null });
  const [drawingPoints, setDrawingPoints] = useState<Point2D[]>([]);
  const [cursorPos, setCursorPos] = useState<Point2D | null>(null);
  const [pendingRoomWallIds, setPendingRoomWallIds] = useState<string[] | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isHoveringContent, setIsHoveringContent] = useState(false);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const panStateRef = useRef<{ startScreen: Point2D; startPan: Point2D } | null>(null);
  const didPanRef = useRef(false);

  const unitSystem = useProjectStore((s) => s.project.unitSystem);
  const projectName = useProjectStore((s) => s.project.name);
  const referenceImages = useProjectStore((s) => s.project.referenceImages);
  const walls = useProjectStore((s) => s.project.floors[0].walls);
  const rooms = useProjectStore((s) => s.project.floors[0].rooms);
  const furniture = useProjectStore((s) => s.project.floors[0].furniture);
  const updateReferenceImageTransform = useProjectStore((s) => s.updateReferenceImageTransform);
  const setReferenceImagePixelsPerMm = useProjectStore((s) => s.setReferenceImagePixelsPerMm);
  const addWalls = useProjectStore((s) => s.addWalls);
  const addOpening = useProjectStore((s) => s.addOpening);
  const addRoom = useProjectStore((s) => s.addRoom);
  const addFurniture = useProjectStore((s) => s.addFurniture);
  const updateFurniture = useProjectStore((s) => s.updateFurniture);
  const removeFurniture = useProjectStore((s) => s.removeFurniture);
  const removeWall = useProjectStore((s) => s.removeWall);
  const removeRoom = useProjectStore((s) => s.removeRoom);

  const zoom = useUiStore((s) => s.zoom);
  const setZoom = useUiStore((s) => s.setZoom);
  const activeTool = useUiStore((s) => s.activeTool);
  const setActiveTool = useUiStore((s) => s.setActiveTool);
  const snapEnabled = useUiStore((s) => s.snapEnabled);
  const selection = useUiStore((s) => s.selection);
  const setSelection = useUiStore((s) => s.setSelection);
  const armedCatalogId = useUiStore((s) => s.armedCatalogId);
  const setArmedCatalogId = useUiStore((s) => s.setArmedCatalogId);
  const finishMappingRequestId = useUiStore((s) => s.finishMappingRequestId);
  const exportImageRequestId = useUiStore((s) => s.exportImageRequestId);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      // Center the mm origin roughly in the middle of the canvas on first layout.
      setPan((prev) => (prev.x === 0 && prev.y === 0 ? { x: width / 2, y: height / 3 } : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cancel in-progress wall drawing when switching away from the drawing tools.
  useEffect(() => {
    if (activeTool !== 'wall' && activeTool !== 'map-floor' && drawingPoints.length > 0) {
      finishWallChain(drawingPoints, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  // Fail-safe: stop panning even if the mouse is released outside the canvas.
  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (panStateRef.current) {
        panStateRef.current = null;
        setIsPanning(false);
      }
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  // Triggered by the toolbar's "Finish Mapping" button; forces the in-progress
  // room trace to close, regardless of proximity to the start point.
  const isFirstMappingRequest = useRef(true);
  useEffect(() => {
    if (isFirstMappingRequest.current) {
      isFirstMappingRequest.current = false;
      return;
    }
    if (drawingPoints.length >= 3) {
      finishWallChain(drawingPoints, true);
    } else {
      discardDrawing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishMappingRequestId]);

  // Triggered by the toolbar's "Save Image" button; exports the current 2D
  // canvas (grid, walls, furniture, reference image) as a PNG.
  const isFirstExportRequest = useRef(true);
  useEffect(() => {
    if (isFirstExportRequest.current) {
      isFirstExportRequest.current = false;
      return;
    }
    const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 });
    if (dataUrl) downloadDataUrl(dataUrl, `${sanitizeFileName(projectName)}-2d.png`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportImageRequestId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingText =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if (e.key === 'Escape') {
        if (drawingPoints.length > 0) {
          // Map-floor tracing is only meant to finish via its explicit button;
          // Escape just discards the in-progress trace instead of keeping partial walls.
          if (activeTool === 'map-floor') {
            setDrawingPoints([]);
          } else {
            finishWallChain(drawingPoints, false);
          }
        }
        setArmedCatalogId(null);
        return;
      }

      if (isEditingText || !selection) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selection.type === 'furniture') removeFurniture(selection.id);
        if (selection.type === 'wall') removeWall(selection.id);
        if (selection.type === 'room') removeRoom(selection.id);
        setSelection(null);
        return;
      }

      if (selection.type === 'furniture') {
        const step = e.shiftKey ? 50 : 10;
        const item = furniture.find((f) => f.id === selection.id);
        if (!item) return;
        const deltas: Record<string, Point2D> = {
          ArrowUp: { x: 0, y: -step },
          ArrowDown: { x: 0, y: step },
          ArrowLeft: { x: -step, y: 0 },
          ArrowRight: { x: step, y: 0 },
        };
        const delta = deltas[e.key];
        if (!delta) return;
        e.preventDefault();
        updateFurniture(item.id, {
          position: { x: item.position.x + delta.x, y: item.position.y + delta.y },
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawingPoints, selection, furniture, activeTool]);

  const overlappingIds = useMemo(() => {
    const ids = new Set<string>();
    const rects = furniture.map((f) => ({ id: f.id, rect: furnitureToOrientedRect(f) }));
    const wallRects = walls.map((w) => wallToOrientedRect(w));

    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        if (orientedRectsOverlap(rects[i].rect, rects[j].rect)) {
          ids.add(rects[i].id);
          ids.add(rects[j].id);
        }
      }
      for (const wallRect of wallRects) {
        if (orientedRectsOverlap(rects[i].rect, wallRect)) {
          ids.add(rects[i].id);
        }
      }
    }
    return ids;
  }, [furniture, walls]);

  const activeImage =
    referenceImages.find(
      (img) => selection?.type === 'referenceImage' && selection.id === img.id,
    ) ?? referenceImages[0];

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const oldZoom = zoom;
    const pointer = layerRef.current?.getStage()?.getPointerPosition();
    if (!pointer) return;

    const newZoom =
      e.evt.deltaY < 0
        ? Math.min(MAX_ZOOM, oldZoom * scaleBy)
        : Math.max(MIN_ZOOM, oldZoom / scaleBy);

    // Keep the point under the cursor stationary while zooming.
    const mmUnderPointer = {
      x: (pointer.x - pan.x) / oldZoom,
      y: (pointer.y - pan.y) / oldZoom,
    };
    setPan({
      x: pointer.x - mmUnderPointer.x * newZoom,
      y: pointer.y - mmUnderPointer.y * newZoom,
    });
    setZoom(newZoom);
  };

  const PAN_DRAG_THRESHOLD_PX = 3;

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only start a grid-pan drag when the pointer is on bare canvas (not a
    // shape like a wall, room label, reference image, or furniture piece),
    // and only while using the Select tool with nothing armed to place.
    const isEmptyBackground = e.target === e.target.getStage();
    if (isEmptyBackground && activeTool === 'select' && !armedCatalogId) {
      panStateRef.current = {
        startScreen: { x: e.evt.clientX, y: e.evt.clientY },
        startPan: pan,
      };
      didPanRef.current = false;
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = layerRef.current?.getRelativePointerPosition();
    if (pos) setCursorPos(pos);

    // Track whether the pointer is over a shape (wall, room label, reference
    // image, furniture) vs. bare grid, so the cursor can hint what a click will do.
    setIsHoveringContent(e.target !== e.target.getStage());

    const panState = panStateRef.current;
    if (!panState) return;
    const deltaX = e.evt.clientX - panState.startScreen.x;
    const deltaY = e.evt.clientY - panState.startScreen.y;
    if (Math.hypot(deltaX, deltaY) > PAN_DRAG_THRESHOLD_PX) {
      didPanRef.current = true;
    }
    setPan({ x: panState.startPan.x + deltaX, y: panState.startPan.y + deltaY });
  };

  const handleMouseUp = () => {
    panStateRef.current = null;
    setIsPanning(false);
  };

  const snapThresholdMm = 10 / zoom;

  function resolveDrawingPoint(raw: Point2D): Point2D {
    const endpointCandidates = walls.flatMap((w) => [w.start, w.end]);
    endpointCandidates.push(...drawingPoints);

    let point = snapEnabled
      ? snapToNearbyPoint(raw, endpointCandidates, snapThresholdMm)
      : raw;

    if (snapEnabled && drawingPoints.length > 0) {
      const last = drawingPoints[drawingPoints.length - 1];
      // Only angle-snap if we didn't already snap to an existing endpoint.
      const snappedToEndpoint = endpointCandidates.some((c) => distance(c, point) < 0.01);
      if (!snappedToEndpoint) {
        point = snapToAngle(last, point, 15);
      }
    }

    return point;
  }

  function discardDrawing() {
    setDrawingPoints([]);
  }

  function finishWallChain(points: Point2D[], closed: boolean) {
    if (points.length >= 2) {
      const segments = closed ? [...points, points[0]] : points;
      const newWalls: Wall[] = [];
      for (let i = 0; i < segments.length - 1; i++) {
        newWalls.push({
          id: uuid(),
          start: segments[i],
          end: segments[i + 1],
          thicknessMm: DEFAULT_WALL_THICKNESS_MM,
          heightMm: DEFAULT_WALL_HEIGHT_MM,
          openings: [],
        });
      }
      addWalls(newWalls);
      if (closed) {
        setPendingRoomWallIds(newWalls.map((w) => w.id));
      }
    }
    setDrawingPoints([]);
  }

  function placeFurnitureAt(catalogId: string, mmPosition: Point2D) {
    const catalogItem = getCatalogItem(catalogId);
    if (!catalogItem) return;
    addFurniture({
      id: uuid(),
      catalogId: catalogItem.id,
      name: catalogItem.name,
      shape: catalogItem.shape,
      widthMm: catalogItem.defaultWidthMm,
      depthMm: catalogItem.defaultDepthMm,
      heightMm: catalogItem.defaultHeightMm,
      position: mmPosition,
      rotationDeg: 0,
      colorHex: catalogItem.defaultColorHex,
    });
  }

  const handleStageClick = () => {
    // Suppress the click that follows a grid-pan drag so it doesn't also
    // place a wall vertex/opening/furniture at the drag's release point.
    if (didPanRef.current) {
      didPanRef.current = false;
      return;
    }

    const pos = layerRef.current?.getRelativePointerPosition();
    if (!pos) return;

    if (armedCatalogId) {
      placeFurnitureAt(armedCatalogId, pos);
      setArmedCatalogId(null);
      return;
    }

    if (activeTool === 'calibrate') {
      setCalibrationPoints((prev) => {
        if (!prev.a) return { a: pos, b: null };
        if (!prev.b) return { a: prev.a, b: pos };
        return { a: pos, b: null };
      });
      return;
    }

    if (activeTool === 'wall' || activeTool === 'map-floor') {
      const point = resolveDrawingPoint(pos);

      if (drawingPoints.length >= 2 && distance(point, drawingPoints[0]) <= snapThresholdMm) {
        finishWallChain(drawingPoints, true);
        if (activeTool === 'map-floor') setActiveTool('select');
        return;
      }

      setDrawingPoints((prev) => [...prev, point]);
      return;
    }

    if (activeTool === 'opening-door' || activeTool === 'opening-window') {
      const hit = findNearestWall(pos, walls, OPENING_SNAP_MAX_DISTANCE_MM);
      if (!hit) return;
      const widthMm = activeTool === 'opening-door' ? DEFAULT_DOOR_WIDTH_MM : DEFAULT_WINDOW_WIDTH_MM;
      const offsetMm = clampOpeningOffset(hit.offsetMm, widthMm, hit.wallLengthMm);
      addOpening(hit.wall.id, {
        id: uuid(),
        type: activeTool === 'opening-door' ? 'door' : 'window',
        offsetMm,
        widthMm,
        swing: activeTool === 'opening-door' ? 'left' : undefined,
      });
    }
  };

  const handleStageDblClick = () => {
    if (activeTool === 'wall' && drawingPoints.length > 0) {
      finishWallChain(drawingPoints, false);
    }
  };

  const cancelCalibration = () => {
    setCalibrationPoints({ a: null, b: null });
    setActiveTool('select');
  };

  const confirmCalibration = (realWorldMm: number) => {
    if (!activeImage || !calibrationPoints.a || !calibrationPoints.b) return;
    const mmDistance = Math.hypot(
      calibrationPoints.b.x - calibrationPoints.a.x,
      calibrationPoints.b.y - calibrationPoints.a.y,
    );
    const newPixelsPerMm = computeRecalibratedPixelsPerMm(
      mmDistance,
      activeImage.pixelsPerMm,
      realWorldMm,
    );
    setReferenceImagePixelsPerMm(activeImage.id, newPixelsPerMm);
    cancelCalibration();
  };

  const gridSpacingMm = unitSystem === 'imperial' ? 304.8 : 100;
  const grid = computeGridLines(
    gridSpacingMm,
    (0 - pan.x) / zoom,
    (size.width - pan.x) / zoom,
    (0 - pan.y) / zoom,
    (size.height - pan.y) / zoom,
  );

  const cursorStyle = isPanning || isDraggingShape
    ? 'grabbing'
    : armedCatalogId
      ? 'copy'
      : activeTool === 'select'
        ? isHoveringContent
          ? 'pointer'
          : 'grab'
        : activeTool === 'wall' || activeTool === 'map-floor'
          ? 'crosshair'
          : activeTool === 'opening-door' || activeTool === 'opening-window'
            ? 'copy'
            : 'crosshair';

  const handleContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const catalogId = e.dataTransfer.getData(CATALOG_DND_MIME);
    if (!catalogId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const mmPos = { x: (screenPos.x - pan.x) / zoom, y: (screenPos.y - pan.y) / zoom };
    placeFurnitureAt(catalogId, mmPos);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleContainerDrop}
    >
      {referenceImages.length === 0 && walls.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-8 text-center text-sm text-gray-500">
          <p>
            Add a reference image (Toolbar &rarr; "Add Reference Image") to trace over a
            blueprint, or use "Map Floor" / "Wall" to start drawing walls directly.
          </p>
          <button
            type="button"
            className="pointer-events-auto rounded border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50"
            onClick={() => setIsSampleModalOpen(true)}
          >
            Load Sample Blueprint
          </button>
        </div>
      )}

      {isSampleModalOpen && (
        <SampleFloorPlanModal
          onSelect={(type: SampleFloorPlanType) => {
            void loadSampleReferenceImage(type);
            setIsSampleModalOpen(false);
          }}
          onCancel={() => setIsSampleModalOpen(false)}
        />
      )}

      {size.width > 0 && size.height > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onDblClick={handleStageDblClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDragStart={() => setIsDraggingShape(true)}
          onDragEnd={() => setIsDraggingShape(false)}
          style={{ cursor: cursorStyle }}
        >
          <Layer ref={layerRef} x={pan.x} y={pan.y} scaleX={zoom} scaleY={zoom}>
            {grid.vertical.map((x) => (
              <Line
                key={`v-${x}`}
                points={[x, grid.horizontal[0] ?? 0, x, grid.horizontal.at(-1) ?? 0]}
                stroke="#e5e7eb"
                strokeWidth={1 / zoom}
              />
            ))}
            {grid.horizontal.map((y) => (
              <Line
                key={`h-${y}`}
                points={[grid.vertical[0] ?? 0, y, grid.vertical.at(-1) ?? 0, y]}
                stroke="#e5e7eb"
                strokeWidth={1 / zoom}
              />
            ))}
            <Line
              points={[0, grid.horizontal[0] ?? -1000, 0, grid.horizontal.at(-1) ?? 1000]}
              stroke="#9ca3af"
              strokeWidth={1.5 / zoom}
            />
            <Line
              points={[grid.vertical[0] ?? -1000, 0, grid.vertical.at(-1) ?? 1000, 0]}
              stroke="#9ca3af"
              strokeWidth={1.5 / zoom}
            />

            <Group clipFunc={rooms.length > 0 ? (ctx) => drawRoomsClipPath(ctx, rooms, walls) : undefined}>
              {referenceImages.map((image) => (
                <ReferenceImageNode
                  key={image.id}
                  image={image}
                  selected={selection?.type === 'referenceImage' && selection.id === image.id}
                  onSelect={() => setSelection({ type: 'referenceImage', id: image.id })}
                  onTransform={(changes) => updateReferenceImageTransform(image.id, changes)}
                />
              ))}
            </Group>

            <WallsLayer
              walls={walls}
              selectedWallId={selection?.type === 'wall' ? selection.id : null}
              onSelectWall={(id) => setSelection({ type: 'wall', id })}
              zoom={zoom}
            />

            <RoomLabels
              rooms={rooms}
              walls={walls}
              unitSystem={unitSystem}
              selectedRoomId={selection?.type === 'room' ? selection.id : null}
              onSelectRoom={(id) => setSelection({ type: 'room', id })}
              zoom={zoom}
            />

            <FurnitureLayer
              furniture={furniture}
              selectedId={selection?.type === 'furniture' ? selection.id : null}
              overlappingIds={overlappingIds}
              onSelect={(id) => setSelection({ type: 'furniture', id })}
              onChange={(id, changes) => updateFurniture(id, changes)}
              zoom={zoom}
              snapEnabled={snapEnabled}
            />

            {drawingPoints.length > 0 && (
              <>
                <Line
                  points={drawingPoints.flatMap((p) => [p.x, p.y])}
                  stroke="#2563eb"
                  strokeWidth={DEFAULT_WALL_THICKNESS_MM / 2}
                  lineCap="round"
                  lineJoin="round"
                />
                {cursorPos && (
                  <Line
                    points={[
                      drawingPoints[drawingPoints.length - 1].x,
                      drawingPoints[drawingPoints.length - 1].y,
                      resolveDrawingPoint(cursorPos).x,
                      resolveDrawingPoint(cursorPos).y,
                    ]}
                    stroke="#93c5fd"
                    strokeWidth={DEFAULT_WALL_THICKNESS_MM / 2}
                    dash={[8 / zoom, 6 / zoom]}
                  />
                )}
                {drawingPoints.map((p, i) => (
                  <Circle key={i} x={p.x} y={p.y} radius={5 / zoom} fill="#2563eb" />
                ))}
              </>
            )}

            {calibrationPoints.a && (
              <Line
                points={[
                  calibrationPoints.a.x,
                  calibrationPoints.a.y,
                  calibrationPoints.b?.x ?? calibrationPoints.a.x,
                  calibrationPoints.b?.y ?? calibrationPoints.a.y,
                ]}
                stroke="#dc2626"
                strokeWidth={2 / zoom}
                dash={[6 / zoom, 4 / zoom]}
              />
            )}
          </Layer>
        </Stage>
      )}

      {activeImage && calibrationPoints.a && calibrationPoints.b && (
        <CalibrationModal
          pointA={calibrationPoints.a}
          pointB={calibrationPoints.b}
          unitSystem={unitSystem}
          onConfirm={confirmCalibration}
          onCancel={cancelCalibration}
        />
      )}

      {pendingRoomWallIds && (
        <RoomNamePrompt
          defaultName={`Room ${rooms.length + 1}`}
          onConfirm={(name) => {
            addRoom({ id: uuid(), name, wallIds: pendingRoomWallIds });
            setPendingRoomWallIds(null);
          }}
          onCancel={() => setPendingRoomWallIds(null)}
        />
      )}
    </div>
  );
}

interface ReferenceImageNodeProps {
  image: ReferenceImage;
  selected: boolean;
  onSelect: () => void;
  onTransform: (changes: Partial<Pick<ReferenceImage, 'offsetMm' | 'rotationDeg'>>) => void;
}

function ReferenceImageNode({ image, selected, onSelect, onTransform }: ReferenceImageNodeProps) {
  const [htmlImage] = useImage(image.dataUrl);
  const widthMm = image.naturalWidthPx / image.pixelsPerMm;
  const heightMm = image.naturalHeightPx / image.pixelsPerMm;

  return (
    <KonvaImage
      image={htmlImage}
      x={image.offsetMm.x}
      y={image.offsetMm.y}
      width={widthMm}
      height={heightMm}
      rotation={image.rotationDeg}
      opacity={image.opacity}
      draggable={!image.locked}
      stroke={selected ? '#2563eb' : undefined}
      strokeWidth={selected ? 2 : 0}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onTransform({ offsetMm: { x: e.target.x(), y: e.target.y() } })}
    />
  );
}
