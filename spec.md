# RoomFlow — Functional & Technical Specification

Companion to [prd.md](prd.md). This document defines the concrete data model, calculations, interactions, and behaviors precisely enough to implement against.

## 1. Base Units & Conversion
- **Internal storage unit:** millimeters (integer or float `mm`), for all lengths, positions, and dimensions. Avoids floating point drift from repeated feet/inch conversions.
- **Display units:** feet-inches (`18'-5"`, nearest 1/8") by default; metric (cm, 1 decimal) via a project-level or app-level toggle.
- **Parsing:** input fields accept flexible formats: `18'5"`, `18' 5"`, `18-5`, `221.5"`, `5.63m`, `563cm` — parsed into mm via a single `parseLength(input, unitSystem)` utility. Invalid input is rejected with inline error, field keeps last valid value.
- **Rotation:** degrees, 0–360, snapping to 15° increments by default (togglable), free rotation via modifier key.

## 2. Core Data Model (JSON-serializable)

```ts
interface Project {
  id: string;                 // uuid
  name: string;
  unitSystem: "imperial" | "metric";
  createdAt: string;           // ISO 8601
  updatedAt: string;
  referenceImages: ReferenceImage[];
  floors: Floor[];             // MVP: typically 1, but modeled as array for future multi-floor
  version: number;             // schema version for migrations
}

interface ReferenceImage {
  id: string;
  fileName: string;
  dataUrl: string;             // embedded base64 (keeps single-file export simple)
  naturalWidthPx: number;
  naturalHeightPx: number;
  // Placement/calibration in floor-plan space:
  offsetMm: { x: number; y: number };
  rotationDeg: number;
  pixelsPerMm: number;         // derived from calibration, editable directly too
  opacity: number;             // 0-1, default 0.5
  locked: boolean;             // prevent accidental drag once placed
}

interface Floor {
  id: string;
  name: string;                // e.g., "Floor 1"
  rooms: Room[];
  walls: Wall[];
  furniture: FurnitureInstance[];
}

interface Room {
  id: string;
  name: string;                // e.g., "Living / Dining"
  wallIds: string[];           // ordered wall segments forming a closed polygon (or open for MVP)
  labelPosition?: { x: number; y: number };
  computedAreaMm2?: number;    // derived, cached
}

interface Wall {
  id: string;
  start: { x: number; y: number };  // mm, floor-plan coordinate space
  end: { x: number; y: number };
  thicknessMm: number;         // default 100mm (~4in)
  heightMm: number;            // default 2440mm (8ft), used for 3D extrusion
  openings: Opening[];         // doors/windows along this wall
}

interface Opening {
  id: string;
  type: "door" | "window";
  offsetMm: number;            // distance from wall.start along the wall
  widthMm: number;
  swing?: "left" | "right" | "double" | "none"; // doors only, cosmetic in MVP
}

interface FurnitureInstance {
  id: string;
  catalogId: string;           // references FurnitureCatalogItem, or "custom"
  name: string;                // user-editable label, defaults to catalog name
  shape: "rect" | "circle" | "lshape";
  widthMm: number;             // x-extent
  depthMm: number;             // y-extent
  heightMm: number;            // z-extent (for 3D)
  lshapeCutout?: { widthMm: number; depthMm: number }; // only for shape === "lshape"
  position: { x: number; y: number }; // center point, mm, floor-plan coordinate space
  rotationDeg: number;
  colorHex: string;            // default per catalog category
  roomId?: string;             // room it's currently placed in (derived/assigned on drop)
}

interface FurnitureCatalogItem {
  id: string;                  // e.g., "sofa-standard"
  name: string;
  category: "seating" | "sleeping" | "tables" | "storage" | "appliance" | "basic-shape";
  shape: "rect" | "circle" | "lshape";
  defaultWidthMm: number;
  defaultDepthMm: number;
  defaultHeightMm: number;
  defaultColorHex: string;
}
```

### Coordinate System
- Floor-plan space: 2D Cartesian, mm, origin at project creation point (e.g., first calibration click), +x right, +y down (matches typical 2D canvas convention). 3D view maps floor-plan (x, y) → 3D (x, z), with y-up representing height.

## 3. Calibration Algorithm
1. User places/positions a `ReferenceImage` on the canvas.
2. User activates "Calibrate" tool, clicks point A then point B on the image (recorded in image-pixel space).
3. App prompts for real-world distance between A and B (parsed via `parseLength`).
4. Compute `pixelsPerMm = pixelDistance(A, B) / mmDistance`.
5. Store on the `ReferenceImage`; all subsequent wall tracing snaps against this scale (grid spacing derived from `pixelsPerMm`).
6. Recalibration overwrites `pixelsPerMm` and prompts to optionally rescale already-traced geometry (MVP: warn only, do not auto-rescale, to avoid surprising destructive edits).

## 4. Wall & Room Authoring Behavior
- Drawing mode: click to start a wall, click again to place each subsequent vertex, double-click or Escape to finish a polyline.
- Snapping: endpoints snap to existing wall endpoints within a pixel threshold (~10px at current zoom), and to 15°/45° angle increments from the previous segment (togglable).
- A "Room" is formed by selecting a closed loop of walls (auto-detected when a polyline closes on itself) and naming it; open (non-closed) wall chains are allowed for partial plans but cannot be named as a "Room" until closed.
- Room area computed via the shoelace formula over the wall centerline polygon (or inner-face polygon — MVP uses centerline for simplicity, documented as approximate).

## 5. Furniture Interaction Behavior
- **Add:** drag item from palette onto canvas, or click palette item then click canvas to place at default rotation, centered at click point.
- **Select:** click selects; shows a bounding box with resize handles (corner = uniform disabled by default, since W/D are independent real dimensions; edge handles resize width or depth respectively) and a rotate handle.
- **Move:** drag (mouse) or arrow keys (1 grid unit per press, larger with Shift).
- **Rotate:** drag rotate handle (snaps every 15° unless a modifier key is held for free rotation), or type an exact degree value in a side panel.
- **Resize:** drag handles, or type exact `widthMm`/`depthMm`/`heightMm` in a side panel — the side panel is the authoritative way to set precise furniture dimensions per the PRD requirement ("typing in dimensions").
- **Overlap detection:** after any move/resize/rotate, run axis-aligned or rotated-rect overlap check (SAT — Separating Axis Theorem) between the furniture's polygon and (a) wall segments' thick rectangles and (b) other furniture polygons. Overlapping items get a visual highlight (e.g., red outline); this is advisory only in MVP, not blocking.
- **Delete:** Delete/Backspace key or context menu, with undo support.

## 6. 2D Rendering
- Canvas-based (see [architect.md](architect.md) for library choice), layers bottom-to-top: reference image → grid → walls/rooms → furniture → selection/UI overlays.
- Zoom/pan via scroll wheel + drag (or pinch on trackpad), with a "fit to content" and "reset zoom" control.
- Dimension labels: room width/height along edges, furniture width/depth on its bounding box, all formatted per active unit system.

## 7. 3D Rendering
- Read-only preview scene generated from the same `Floor` data: walls extruded from centerline by `thicknessMm`/`heightMm`; furniture rendered as boxes (rect/lshape) or cylinders (circle) at `heightMm`.
- Default camera: isometric-like orbit view centered on the floor's bounding box; orbit/pan/zoom via mouse.
- Rebuilt/updated reactively whenever the underlying `Floor` data changes (no manual "sync" action).

## 8. Persistence
- **Export:** serialize `Project` (including embedded reference images as base64 `dataUrl`) to a `_roomflow.json` file, downloaded via browser.
- **Import:** file picker reads a `_roomflow.json`, validates against `version` and a JSON schema, migrates if an older schema version, then loads into app state.
- **Auto-save:** debounced (e.g., 2s after last change) write of current `Project` to `localStorage` under a fixed key; on app load, offer "Resume last session" if present.
- **Schema versioning:** `Project.version` incremented on breaking data model changes; a migration function chain (`migrateV1toV2`, etc.) applied on import/load.

## 9. Validation Rules
- Furniture dimensions must be > 0 and below a sanity ceiling (e.g., 20m) to catch unit-entry mistakes.
- Wall thickness > 0; opening `widthMm` cannot exceed the host wall segment length; opening `offsetMm + widthMm` must be ≤ wall length.
- Calibration real-world distance must be > 0.

## 10. Accessibility & Input
- All numeric transforms (position, rotation, dimensions) editable via keyboard/side-panel inputs, not just drag, so precise values are always achievable without fine mouse control.
- Sufficient color contrast for walls/furniture/labels; furniture category color defaults chosen from a colorblind-safe palette.

## 11. Out of Scope Details (explicit, to avoid ambiguity)
- No physics simulation (gravity, stacking).
- No door-swing collision logic beyond visual arc; not enforced.
- No multi-user cursors/presence.
