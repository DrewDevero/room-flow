import type { Wall } from '../../core/model/types';
import { mmToM } from '../../core/geometry/scale3d';
import { buildWallSegments3D } from '../../core/geometry/wallSegments3d';

interface WallMesh3DProps {
  wall: Wall;
}

// Renders each wall as one box per solid segment, split around its door/window
// openings (buildWallSegments3D), so doors show a walk-through gap with a
// header above, and windows show a glazed pane between sill and header.
export function WallMesh3D({ wall }: WallMesh3DProps) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dy);
  const thicknessM = mmToM(wall.thicknessMm);
  const angleRad = Math.atan2(dy, dx);
  const ux = length === 0 ? 0 : dx / length;
  const uy = length === 0 ? 0 : dy / length;

  const segments = buildWallSegments3D(wall);

  return (
    <>
      {segments.map((segment, i) => {
        const midOffset = (segment.offsetStartMm + segment.offsetEndMm) / 2;
        const midX = mmToM(wall.start.x + ux * midOffset);
        const midZ = mmToM(wall.start.y + uy * midOffset);
        const midY = mmToM((segment.bottomMm + segment.topMm) / 2);
        const lengthM = mmToM(segment.offsetEndMm - segment.offsetStartMm);
        const heightM = mmToM(segment.topMm - segment.bottomMm);

        return (
          <mesh key={i} position={[midX, midY, midZ]} rotation={[0, -angleRad, 0]}>
            <boxGeometry args={[lengthM, heightM, thicknessM]} />
            {segment.material === 'glass' ? (
              <meshStandardMaterial color="#93c5fd" transparent opacity={0.4} />
            ) : (
              <meshStandardMaterial color="#9ca3af" />
            )}
          </mesh>
        );
      })}
    </>
  );
}
