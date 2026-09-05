# RoomFlow — Task Breakdown

Granular tasks per milestone in [plan.md](plan.md). Check items off as implementation proceeds (not started yet — docs-only phase per current request).

## M0 — Project Setup
- [ ] Scaffold Vite + React + TypeScript project.
- [ ] Install core deps: `zustand`, `zundo` (or custom undo middleware), `immer`, `zod`, `konva`/`react-konva`, `three`/`@react-three/fiber`/`@react-three/drei`, `tailwindcss`.
- [ ] Configure ESLint + Prettier + `tsconfig` strict mode.
- [ ] Set up Vitest + React Testing Library; Playwright config (empty smoke test).
- [ ] Define `core/model` TypeScript types (`Project`, `Floor`, `Room`, `Wall`, `Opening`, `FurnitureInstance`, `FurnitureCatalogItem`) per [spec.md](spec.md) §2.
- [ ] Define matching Zod schemas for runtime validation (import/export, form inputs).
- [ ] Implement `core/units`: `parseLength`, `formatLength`, mm↔ft-in / mm↔metric conversions + unit tests.
- [ ] Set up `state/projectStore` (Zustand) with a minimal empty-project initial state and undo/redo wiring.
- [ ] Basic app shell layout (toolbar / palette / canvas / inspector / status bar placeholders) per [design.md](design.md) §2.

## M1 — Calibration & Reference Image
- [ ] File upload control (accept jpg/png), read as data URL, downscale to max 2000px longest side.
- [ ] `ReferenceImage` layer in Konva canvas: render, drag to reposition, rotate handle, opacity slider.
- [ ] "Calibrate" tool: two-click point capture with a visual preview line + distance-so-far in pixels.
- [ ] Calibration modal: numeric input (unit-aware parse) for real-world distance → compute and store `pixelsPerMm`.
- [ ] Grid rendering driven by `pixelsPerMm` (dynamic grid spacing at current zoom).
- [ ] Recalibration flow: re-run calibrate tool, warn (non-destructive) before overwriting existing `pixelsPerMm`.
- [ ] Unit tests for calibration math; component test for the calibration modal flow.

## M2 — 2D Floor Plan Authoring
- [ ] Wall drawing tool: click-to-add-vertex polyline, double-click/Escape to finish.
- [ ] Endpoint snapping (nearby vertices) and angle snapping (15°/45°), togglable.
- [ ] Wall rendering as thick rectangles from centerline + `thicknessMm`.
- [ ] Opening tool: place door/window along a wall segment with width + offset, validate against wall length (spec §9).
- [ ] Door swing arc / window glyph rendering.
- [ ] Room closure detection when a wall polyline forms a closed loop.
- [ ] Room naming UI (inline input at polygon centroid) + room list in inspector when nothing selected.
- [ ] Room area calculation (shoelace formula) + live label rendering.
- [ ] Undo/redo coverage for all wall/opening/room actions.
- [ ] Selection + delete for walls/openings/rooms.
- [ ] Manual test pass: fully trace the sample [Room2105_bluprint.jpeg](assets/Room2105_bluprint.jpeg) into a multi-room plan (living/dining, kitchen, bath, closets).

## M3 — Furniture Palette & Placement
- [ ] Seed `FurnitureCatalogItem` data: basic shapes (rect/circle/L-shape) + presets (bed, sofa, dining table, chair, desk, dresser, etc.) with default dimensions/colors.
- [ ] Palette UI: categorized/searchable list with thumbnails and default-dimension captions.
- [ ] Drag-from-palette-to-canvas placement; click-to-arm/click-to-place alternative.
- [ ] `FurnitureInstance` rendering for each shape type (rect, circle, lshape) in Konva.
- [ ] Selection + bounding-box handles: move (drag + arrow keys), rotate (drag handle with snap + free-rotate modifier), resize (edge handles for width/depth independently).
- [ ] Inspector fields for precise numeric entry: name, width/depth/height, position x/y, rotation degrees, color, duplicate, delete.
- [ ] Overlap detection (SAT) between furniture↔furniture and furniture↔wall; visual warning outline + tooltip.
- [ ] Undo/redo coverage for all furniture actions.
- [ ] Unit tests for SAT overlap logic and catalog defaults application.

## M4 — 3D Preview
- [ ] `features/preview-3d` scene subscribing to `projectStore`.
- [ ] Wall extrusion meshes from centerline + thickness + height.
- [ ] Furniture meshes: box geometry for rect/lshape, cylinder for circle, positioned/rotated to match 2D state.
- [ ] Orbit/pan/zoom camera controls (`@react-three/drei` `OrbitControls`), default isometric-ish framing on floor bounding box.
- [ ] "2D / 3D" tab toggle in toolbar preserving full app state.
- [ ] Throttle/batch scene rebuilds during active drags for performance (per [architect.md](architect.md) §6).
- [ ] Manual test: confirm 3D view always matches latest 2D edits with no stale state after tab switches.

## M5 — Persistence
- [ ] Export: serialize `Project` to `_roomflow.json`, trigger browser download.
- [ ] Import: file picker → parse JSON → Zod-validate → schema version check/migration → load into store.
- [ ] Schema version constant + migration function chain scaffold (even if empty for v1).
- [ ] Debounced (~2s) autosave to `localStorage`.
- [ ] "Resume last session" prompt on app load if autosave data exists.
- [ ] Error handling: corrupt/incompatible import shows a non-destructive toast, current session unaffected.
- [ ] Unit tests: round-trip export→import equality; migration function scaffold test.

## M6 — Polish & MVP Hardening
- [ ] Empty-state hints (no reference image / no walls yet) per [design.md](design.md) §6.
- [ ] Accessibility pass: keyboard tab order, contrast check, text-labeled icons.
- [ ] Performance check with a larger synthetic plan (e.g., 6 rooms, 40 furniture pieces).
- [ ] Responsive layout tweaks for smaller laptop screens (collapse palette/inspector to toggles if needed).
- [ ] Build a demo/sample project from `assets/Room2105_bluprint.jpeg` as a bundled example/onboarding fixture.
- [ ] Write a short README covering setup, scripts, and architecture pointers back to these docs.
- [ ] Final walkthrough against PRD §8 success metrics.

## Backlog (Post-MVP, not scheduled)
- [ ] OCR dimension-text extraction (PRD Phase 2).
- [ ] CV-based automatic wall detection (PRD Phase 3).
- [ ] Editable 3D view.
- [ ] Expanded furniture catalog with imagery/simple models, materials/colors.
- [ ] Hard collision constraints / clearance-path checking.
- [ ] Cloud accounts, project sharing, collaboration (possible Firebase adoption).
- [ ] Mobile app.
