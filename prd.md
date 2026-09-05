# RoomFlow — Product Requirements Document (PRD)

## 1. Summary
RoomFlow is a web app that lets a user recreate the floor plan of a home (studio, apartment, or house) from a reference blueprint image, then furnish it with resizable basic shapes representing furniture — in both 2D (top-down) and 3D (preview) views — to test how furniture fits before buying or moving it.

## 2. Problem Statement
People moving into a new home or rearranging furniture often only have a static blueprint image (e.g., a floor plan flyer like `assets/Room2105_bluprint.jpeg`) with printed room dimensions. There's no easy way to:
- Turn that flat image into an accurate, to-scale digital floor plan.
- Visualize whether specific furniture pieces (with real dimensions) will fit in a space, individually or together.
- Experiment with layouts without physically moving furniture.

## 3. Goals
- Let a user recreate a to-scale multi-room floor plan by tracing over an uploaded blueprint image, calibrated against a known real-world dimension.
- Let a user populate rooms with basic parametric shapes (box, circle, L-shape) and a small preset library (bed, sofa, table, chair, etc.), each with user-editable width/depth/height.
- Provide a 2D top-down editor as the primary editing surface, and a 3D preview to visualize the space and furniture more intuitively.
- Allow saving/loading a project as a portable file (JSON export/import) — no account required.

## 4. Non-Goals (MVP)
- Automated computer-vision wall detection from photos.
- OCR-based auto-reading of printed dimension text.
- Cloud accounts, multi-user collaboration, or sharing links.
- Photorealistic rendering, textures/materials catalog, or lighting simulation.
- Structural elements beyond walls/doors/windows (e.g., plumbing, electrical).

## 5. Target Users
- Individuals moving into a new apartment/house who received a blueprint (e.g., from a leasing office) and want to plan furniture placement before move-in.
- Anyone re-arranging furniture in an existing room and wanting to test layouts virtually.

## 6. User Stories
1. As a user, I can upload a blueprint image so I have a visual reference to trace over.
2. As a user, I can calibrate scale by clicking two points on the image that correspond to a known printed dimension and entering that length.
3. As a user, I can draw walls, doors, and windows on top of the calibrated image to build an accurate 2D floor plan.
4. As a user, I can define multiple rooms within one project (multi-room apartment support in MVP).
5. As a user, I can add a furniture shape to a room by choosing a basic shape or a preset (bed, sofa, table, chair, etc.) and typing in its width/depth/height.
6. As a user, I can move, rotate, and resize furniture shapes within the 2D plan and see them snap to reasonable increments and avoid/highlight overlaps with walls or other furniture.
7. As a user, I can switch to a 3D view to see the room and furniture rendered as extruded/boxed volumes.
8. As a user, I can save my project to a file and reload it later.
9. As a user, I can see live dimension labels (feet/inches, with a metric toggle) for rooms and furniture as I edit.

## 7. Functional Requirements
### 7.1 Blueprint Reference & Calibration
- Upload an image (jpg/png) as a non-interactive background layer in the 2D editor.
- Adjust image position/scale/rotation/opacity so it aligns with a drawing grid.
- Calibration tool: click two points + enter the real-world distance between them → app computes pixels-per-unit scale for that image.

### 7.2 Floor Plan Authoring (2D)
- Draw walls as line segments/polylines with a settable thickness.
- Place doors and windows as openings along a wall segment.
- Group walls into named rooms; support multiple rooms per project.
- Display computed room dimensions and area.
- Undo/redo for all drawing actions.

### 7.3 Furniture Placement
- Furniture library: parametric primitives (rectangle/box, circle/cylinder, L-shape) and preset items (bed, sofa, dining table, chair, desk, dresser, etc.), each with default dimensions the user can override.
- Add furniture to a room via drag-from-palette or click-to-place.
- Transform furniture: move (drag or arrow keys), rotate (free + 15°/45° snap), resize by typing exact dimensions.
- Visual/logical collision indication when furniture overlaps walls or other furniture (non-blocking warning, not a hard constraint in MVP).
- Label each furniture instance with its dimensions and an optional custom name.

### 7.4 2D/3D Views
- 2D top-down canvas is the primary editing surface (pan/zoom, grid, snapping).
- 3D view renders the same scene as extruded walls (from wall height) and boxed/primitive furniture, with orbit/pan/zoom camera controls. Read-only preview in MVP (edits happen in 2D).

### 7.5 Units & Measurement
- Support feet/inches (e.g., `18'-5"`) as default, matching typical US blueprint notation, with a toggle to metric (cm/m).
- All internal storage in a single base unit (millimeters) with display-layer conversion/formatting.

### 7.6 Project Persistence
- Export project (floor plan + furniture + calibration + reference image reference) to a single JSON file.
- Import a previously exported JSON file to resume editing.
- Auto-save to browser local storage as a safety net between explicit exports.

## 8. Success Metrics (MVP)
- A user can go from an uploaded blueprint image to a calibrated, multi-room, to-scale floor plan with furniture placed in under ~15 minutes for a studio/1BR-sized space.
- Dimension accuracy: traced walls/furniture within 2% of user-entered real-world values (limited by manual tracing precision, not by rounding/math errors).
- 3D preview reflects 2D edits with no manual sync step.

## 9. Future Phases (Post-MVP)
- Phase 2: OCR to auto-detect printed dimension text (e.g., `18'-5" X 13'-7"`) and suggest room dimensions/labels.
- Phase 3: Computer-vision-assisted wall auto-detection from the blueprint image.
- Editable 3D view (move/rotate furniture directly in 3D).
- Larger/custom furniture catalog with images or simple 3D models, material/color choices.
- Hard collision constraints, clearance-path checking (e.g., walkways, door swing clearance).
- Cloud accounts, project sharing, multi-user collaboration.
- Mobile app.

## 10. Open Risks
- Manual tracing accuracy depends on image resolution/perspective distortion of the source photo (e.g., phone photos of printed flyers are rarely perfectly flat/orthogonal).
- Keeping 2D and 3D representations in sync as a single source of truth (data model) needs care — see [architect.md](architect.md).
