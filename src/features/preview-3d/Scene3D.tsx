import { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useProjectStore } from '../../state/projectStore';
import { useUiStore } from '../../state/uiStore';
import { sanitizeFileName } from '../../state/persistence';
import { downloadDataUrl } from '../../state/imageExport';
import { mmToM } from '../../core/geometry/scale3d';
import { WallMesh3D } from './WallMesh3D';
import { FurnitureMesh3D } from './FurnitureMesh3D';

// Lives inside the R3F render tree so it can use useThree() to reach the
// canvas' WebGL context; exports whatever angle the camera/orbit is currently at.
function ExportHandler() {
  const { gl, scene, camera } = useThree();
  const projectName = useProjectStore((s) => s.project.name);
  const exportImageRequestId = useUiStore((s) => s.exportImageRequestId);
  const exportImageViewMode = useUiStore((s) => s.exportImageViewMode);

  useEffect(() => {
    if (exportImageRequestId === 0 || exportImageViewMode !== '3d') return;
    let nextFrame = 0;
    const frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        // Render one more frame right before capturing, since the buffer may
        // otherwise reflect a stale frame from before the export was requested.
        gl.render(scene, camera);
        const dataUrl = gl.domElement.toDataURL('image/png');
        downloadDataUrl(dataUrl, `${sanitizeFileName(projectName)}-3d.png`);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(nextFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportImageRequestId, exportImageViewMode]);

  return null;
}

export function Scene3D() {
  const walls = useProjectStore((s) => s.project.floors[0].walls);
  const furniture = useProjectStore((s) => s.project.floors[0].furniture);

  const bounds = useMemo(() => {
    const points = walls.flatMap((w) => [w.start, w.end]);
    if (points.length === 0) {
      return { minX: -2000, maxX: 2000, minY: -2000, maxY: 2000 };
    }
    return {
      minX: Math.min(...points.map((p) => p.x)),
      maxX: Math.max(...points.map((p) => p.x)),
      minY: Math.min(...points.map((p) => p.y)),
      maxY: Math.max(...points.map((p) => p.y)),
    };
  }, [walls]);

  const centerX = mmToM((bounds.minX + bounds.maxX) / 2);
  const centerZ = mmToM((bounds.minY + bounds.maxY) / 2);
  const spanM = Math.max(
    mmToM(bounds.maxX - bounds.minX),
    mmToM(bounds.maxY - bounds.minY),
    3,
  );

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        position: [centerX + spanM * 0.8, spanM * 0.9, centerZ + spanM * 0.8],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
    >
      <ExportHandler />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />

      <mesh position={[centerX, -0.01, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[spanM * 3, spanM * 3]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {walls.map((wall) => (
        <WallMesh3D key={wall.id} wall={wall} />
      ))}

      {furniture.map((item) => (
        <FurnitureMesh3D key={item.id} item={item} />
      ))}

      <OrbitControls target={[centerX, 0, centerZ]} makeDefault />
    </Canvas>
  );
}
