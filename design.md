# RoomFlow — Design Document (UX/UI)

Companion to [prd.md](prd.md), [spec.md](spec.md), [architect.md](architect.md).

## 1. Design Principles
- **Precision over prettiness (MVP):** every visual transform (drag/rotate/resize) must have an equivalent exact numeric input, since the core use case is "will this specific 60"x36" sofa fit here."
- **Trace, don't guess:** the reference blueprint image is always visible (adjustable opacity) while drawing, so the user is directly copying real geometry rather than eyeballing it.
- **One model, two views:** 2D and 3D are always in sync (see [architect.md](architect.md) §4); switching views never loses or duplicates edits.

## 2. Layout (Desktop-first Responsive Web)

```
┌─────────────────────────────────────────────────────────────────┐
│ Toolbar: Project name | Undo/Redo | 2D/3D tabs | Units | Export │
├───────────────┬───────────────────────────────────┬─────────────┤
│               │                                   │             │
│  Furniture    │      Canvas (2D editor or          │  Inspector  │
│  Palette      │      3D preview)                   │  Panel      │
│  (left, ~220px)      (center, fills space)          │ (right,~280px)
│               │                                     │             │
├───────────────┴───────────────────────────────────┴─────────────┤
│ Status bar: zoom %, cursor coords, selected item summary        │
└─────────────────────────────────────────────────────────────────┘
```

- **Toolbar (top):** project name (editable), Undo/Redo buttons, "2D / 3D" view toggle (tabs, not separate pages — state persists switching), unit system toggle (ft-in / metric), Import/Export buttons, "Add Reference Image" + "Calibrate" tool entry points.
- **Furniture Palette (left):** searchable/categorized list (Basic Shapes, Seating, Sleeping, Tables, Storage, Appliances) — matches `FurnitureCatalogItem.category`. Each entry shows a small icon/thumbnail + default dimensions; drag onto canvas or click-to-arm then click canvas.
- **Canvas (center):**
  - *2D mode:* grid background, reference image (togglable visibility + opacity slider), walls/rooms, furniture, selection handles, live dimension labels near hovered/selected/actively-dragged elements.
  - *3D mode:* orbit-controllable scene, simple neutral lighting, ground plane, extruded walls (semi-transparent option to see furniture from above-ish angles), furniture as colored boxes/cylinders labeled on hover.
- **Inspector Panel (right):** context-sensitive to current selection:
  - Nothing selected → project/floor summary (room list, total area).
  - Wall selected → thickness, height, start/end coordinates, delete.
  - Room selected → name, computed area, room color/label position.
  - Furniture selected → name, shape type, width/depth/height (numeric fields), position (x/y), rotation (degrees field + snap toggle), color, delete/duplicate.
  - Reference image selected → opacity slider, lock toggle, "Recalibrate" button, offset/rotation fields.
- **Status bar (bottom):** zoom %, live cursor coordinates in active units, one-line summary of selection (e.g., "Sofa — 84\" x 36\" — rotated 90°").

## 3. Key Flows (Wireframe-level)

### 3.1 First-Run / New Project
1. Landing screen: "New Project" / "Import Project" / "Resume last session" (if autosave present).
2. New Project → prompts project name + unit system → opens empty 2D canvas with palette/inspector visible but empty state hints ("Upload a blueprint image to trace over, or start drawing walls directly").

### 3.2 Upload & Calibrate
1. Toolbar → "Add Reference Image" → file picker → image appears centered on canvas at a default scale, semi-transparent.
2. User drags/rotates image roughly into place (optional).
3. Toolbar/contextual → "Calibrate" → cursor becomes crosshair → click point A, click point B (a straight line preview is drawn between them) → modal: "Enter real-world distance" (numeric input with unit-aware parsing, pre-filled placeholder like `18'-5"`) → Confirm → scale applied, grid updates, calibration modal closes, subtle toast "Calibrated: 1 grid square = 1 ft" (or similar).

### 3.3 Trace Walls & Define Rooms
1. Toolbar → "Wall" tool → click to place vertices along the traced image edges, snapping to angle increments and nearby endpoints (visual snap indicator: highlighted vertex/angle guide line).
2. Double-click / Escape ends the current polyline.
3. When a polyline closes into a loop, app auto-suggests "Name this room?" inline text input appears at the polygon centroid; user types "Living / Dining" (matching printed label) → room chip appears with computed area.
4. Repeat for additional rooms (kitchen, bath, closets) to build the full apartment per PRD's multi-room MVP scope.
5. Doors/windows: "Opening" tool → click a point along an existing wall → small modal/inline control to set type (door/window) and width → opening renders as a gap with a door-swing arc or window glyph.

### 3.4 Add & Fit Furniture
1. From palette, drag "Sofa" onto the Living/Dining room → instance appears at default size (e.g., 84"x36"), selected, inspector shows fields.
2. User edits Width/Depth to match their actual sofa (e.g., 90"x38") → shape updates live on canvas.
3. User drags to position against a wall; rotate handle or typed rotation (e.g., 90°) orients it.
4. If overlapping a wall/other furniture, the shape outline turns red/amber (non-blocking) with a small tooltip "Overlaps wall" — user adjusts as desired.
5. Repeat for additional pieces (bed, table+chairs, dresser), each independently dimensioned.

### 3.5 Preview in 3D
1. Toolbar → "3D" tab → canvas swaps to orbit-controlled 3D scene reflecting current furniture/wall layout instantly.
2. User orbits/zooms to check clearances, sightlines, proportions.
3. Switching back to "2D" tab preserves exact state (same underlying store).

### 3.6 Save/Export/Resume
1. Toolbar → "Export" → downloads `<project-name>_roomflow.json`.
2. Later session → "Import Project" → file picker → validated/migrated → loads directly into the same layout.
3. Autosave silently persists to localStorage; if the user returns without exporting, "Resume last session" restores it.

## 4. Visual Style (MVP)
- Clean, low-chrome, neutral palette (light gray canvas background, white panels) so furniture/wall colors stand out.
- Walls: dark gray/black filled rectangles (per thickness).
- Rooms: subtle unique pastel fill per room for quick visual distinction, with room name + area label.
- Furniture: colorblind-safe categorical palette (e.g., Okabe-Ito) by category (seating, sleeping, tables, storage, appliances), consistent between 2D and 3D.
- Selection state: consistent accent color (e.g., blue outline + handles) across walls/rooms/furniture/reference image.
- Overlap warning: amber/red outline + small icon, distinguishable from normal selection color.

## 5. Responsiveness & Accessibility
- Primary target is desktop/laptop browser (precise mouse interaction for tracing/placing); tablet support is a stretch goal, not required for MVP given the precision-input nature of the task.
- All panels reachable/operable via keyboard (tab order: toolbar → palette → canvas selection → inspector fields).
- Numeric inputs use native `<input type="text">` with custom parsing (not `type="number"`) to support `18'-5"` style entry, but must still support paste and standard text editing.
- Minimum text contrast ratio 4.5:1 for labels; icons paired with text labels (not icon-only) in the palette.

## 6. Empty/Edge States
- No reference image yet: canvas shows a light dotted grid and a centered hint text with "Add Reference Image" / "Start Drawing Walls" quick actions.
- Furniture placed outside any room boundary: allowed (e.g., hallway furniture), `roomId` left unset, no error — area/overlap checks still apply against nearby walls.
- Import of an incompatible/corrupt JSON file: clear error toast ("This file isn't a valid RoomFlow project") without crashing or clearing current in-progress work.
