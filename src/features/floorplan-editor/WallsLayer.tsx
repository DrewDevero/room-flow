import { Arc, Line } from 'react-konva';
import type { Opening, Wall } from '../../core/model/types';

// Must match the CanvasArea background (Tailwind bg-gray-50) so opening gaps
// visually "erase" through the solid wall line.
const CANVAS_BG = '#f9fafb';

interface WallsLayerProps {
  walls: Wall[];
  selectedWallId: string | null;
  onSelectWall: (id: string) => void;
  zoom: number;
}

export function WallsLayer({ walls, selectedWallId, onSelectWall, zoom }: WallsLayerProps) {
  return (
    <>
      {walls.map((wall) => (
        <WallShape
          key={wall.id}
          wall={wall}
          selected={wall.id === selectedWallId}
          onSelect={() => onSelectWall(wall.id)}
          zoom={zoom}
        />
      ))}
    </>
  );
}

function WallShape({
  wall,
  selected,
  onSelect,
  zoom,
}: {
  wall: Wall;
  selected: boolean;
  onSelect: () => void;
  zoom: number;
}) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dy);
  const angleRad = Math.atan2(dy, dx);
  const ux = length === 0 ? 0 : dx / length;
  const uy = length === 0 ? 0 : dy / length;

  const pointAt = (offsetMm: number) => ({
    x: wall.start.x + ux * offsetMm,
    y: wall.start.y + uy * offsetMm,
  });

  return (
    <>
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke={selected ? '#2563eb' : '#374151'}
        strokeWidth={wall.thicknessMm}
        lineCap="square"
        hitStrokeWidth={Math.max(wall.thicknessMm, 12 / zoom)}
        onClick={onSelect}
        onTap={onSelect}
      />

      {wall.openings.map((opening) => (
        <OpeningGlyph
          key={opening.id}
          opening={opening}
          wallThicknessMm={wall.thicknessMm}
          angleRad={angleRad}
          startPoint={pointAt(opening.offsetMm)}
          endPoint={pointAt(opening.offsetMm + opening.widthMm)}
        />
      ))}
    </>
  );
}

function OpeningGlyph({
  opening,
  wallThicknessMm,
  angleRad,
  startPoint,
  endPoint,
}: {
  opening: Opening;
  wallThicknessMm: number;
  angleRad: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}) {
  const perpX = -Math.sin(angleRad);
  const perpY = Math.cos(angleRad);
  const half = wallThicknessMm / 2;

  // Erase the solid wall segment across the opening span.
  const eraser = (
    <Line
      points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
      stroke={CANVAS_BG}
      strokeWidth={wallThicknessMm + 4}
      lineCap="butt"
    />
  );

  if (opening.type === 'window') {
    return (
      <>
        {eraser}
        <Line
          points={[
            startPoint.x + perpX * half * 0.5,
            startPoint.y + perpY * half * 0.5,
            endPoint.x + perpX * half * 0.5,
            endPoint.y + perpY * half * 0.5,
          ]}
          stroke="#374151"
          strokeWidth={Math.max(2, wallThicknessMm * 0.15)}
        />
        <Line
          points={[
            startPoint.x - perpX * half * 0.5,
            startPoint.y - perpY * half * 0.5,
            endPoint.x - perpX * half * 0.5,
            endPoint.y - perpY * half * 0.5,
          ]}
          stroke="#374151"
          strokeWidth={Math.max(2, wallThicknessMm * 0.15)}
        />
      </>
    );
  }

  // Door: erase the gap, then draw a simplified quarter-circle swing from the start edge.
  const swingDeg = (angleRad * 180) / Math.PI;
  return (
    <>
      {eraser}
      <Arc
        x={startPoint.x}
        y={startPoint.y}
        innerRadius={0}
        outerRadius={opening.widthMm}
        angle={90}
        rotation={swingDeg}
        stroke="#9ca3af"
        strokeWidth={Math.max(1, wallThicknessMm * 0.08)}
      />
      <Line
        points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
        stroke="#9ca3af"
        strokeWidth={Math.max(1, wallThicknessMm * 0.08)}
      />
    </>
  );
}
