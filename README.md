# RoomFlow

RoomFlow lets you trace a floor plan over a blueprint image, calibrate it to real-world
scale, and furnish it with resizable furniture in both 2D and 3D — so you can see how
furniture will actually fit before you buy or move it.

See [prd.md](prd.md), [spec.md](spec.md), [architect.md](architect.md), [design.md](design.md),
[plan.md](plan.md), and [tasks.md](tasks.md) for the full product/technical documentation.

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL. Click **Load Sample Blueprint** on the empty canvas to try the
app with the bundled sample floor plan ([assets/Room2105_bluprint.jpeg](assets/Room2105_bluprint.jpeg)),
or use **Add Reference Image** to upload your own.

## Typical Workflow

1. **Add Reference Image** — upload a blueprint photo/scan as a tracing layer.
2. **Calibrate** — click two points on a printed dimension (e.g. a wall labeled `18'-5"`),
   enter that real-world length, and the image snaps to true scale.
3. **Map Floor** — click to drop anchor points along each room's walls, then click
   **Finish Mapping** to close the loop, name the room, and create its walls. Repeat per
   room for a multi-room apartment. Once a room exists, the reference image is clipped to
   the traced area. Use **Wall**/**Door**/**Window** for further edits.
4. **Furniture** — drag or click a palette item onto the canvas, then use the Inspector to
   type exact width/depth/height, position, and rotation. Overlaps with walls or other
   furniture are outlined in red (advisory only).
5. **3D tab** — orbit/pan/zoom a live 3D preview generated from the same floor plan data.
6. **Export/Import** — save your project to a `_roomflow.json` file, or reload one later.
   Work also autosaves to your browser's local storage between explicit exports.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest unit test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview a production build locally |

## Project Structure

```
src/
  core/           # Framework-agnostic model, geometry, units, catalog (no React/Konva/Three deps)
  state/          # Zustand stores: project data (undo/redo), transient UI state, persistence, toasts
  features/
    floorplan-editor/  # 2D Konva canvas: walls, rooms, openings, furniture, calibration
    preview-3d/         # react-three-fiber 3D scene (lazy-loaded)
  app/            # Top-level layout: Toolbar, FurniturePalette, CanvasArea, InspectorPanel, StatusBar
```

`core/model/types.ts` is the single source of truth for the data model — both the 2D and
3D views render directly from it, and it's also the `_roomflow.json` export format.

## Known MVP Limitations

- Reference-image tracing is manual (click to place anchors); there's no automatic
  OCR/computer-vision wall detection yet (see [prd.md](prd.md) §9 for planned phases).
- Overlap detection treats circles and L-shapes as their bounding rectangle (advisory
  warning only, never blocks placement).
- Wall openings (doors/windows) are cut into the 3D geometry (door gap + header, window
  sill/glass/header), but the 3D view itself is still read-only preview only.
- No accounts/cloud sync; persistence is local file export/import plus browser autosave.


You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
