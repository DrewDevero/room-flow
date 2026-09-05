import * as THREE from 'three';
import { useMemo } from 'react';
import type { FurnitureInstance } from '../../core/model/types';
import { mmToM } from '../../core/geometry/scale3d';

interface FurnitureMesh3DProps {
  item: FurnitureInstance;
}

// Maps 2D rotationDeg (clockwise, Y-down floor-plan space) to a Y-axis rotation
// in the Y-up 3D scene.
function toSceneRotationY(rotationDeg: number): number {
  return -(rotationDeg * Math.PI) / 180;
}

export function FurnitureMesh3D({ item }: FurnitureMesh3DProps) {
  const x = mmToM(item.position.x);
  const z = mmToM(item.position.y);
  const heightM = mmToM(item.heightMm);
  const rotationY = toSceneRotationY(item.rotationDeg);

  if (item.shape === 'circle') {
    return (
      <mesh position={[x, heightM / 2, z]} rotation={[0, rotationY, 0]}>
        <cylinderGeometry
          args={[mmToM(item.widthMm) / 2, mmToM(item.widthMm) / 2, heightM, 32]}
        />
        <meshStandardMaterial color={item.colorHex} />
      </mesh>
    );
  }

  if (item.shape === 'lshape') {
    return <LShapeMesh3D item={item} x={x} z={z} heightM={heightM} rotationY={rotationY} />;
  }

  return (
    <mesh position={[x, heightM / 2, z]} rotation={[0, rotationY, 0]}>
      <boxGeometry args={[mmToM(item.widthMm), heightM, mmToM(item.depthMm)]} />
      <meshStandardMaterial color={item.colorHex} />
    </mesh>
  );
}

function LShapeMesh3D({
  item,
  x,
  z,
  heightM,
  rotationY,
}: {
  item: FurnitureInstance;
  x: number;
  z: number;
  heightM: number;
  rotationY: number;
}) {
  const geometry = useMemo(() => {
    const w = mmToM(item.widthMm);
    const d = mmToM(item.depthMm);
    const cutW = mmToM(Math.min(item.lshapeCutout?.widthMm ?? item.widthMm / 2, item.widthMm));
    const cutD = mmToM(Math.min(item.lshapeCutout?.depthMm ?? item.depthMm / 2, item.depthMm));
    const halfW = w / 2;
    const halfD = d / 2;

    const shape = new THREE.Shape();
    shape.moveTo(-halfW, -halfD);
    shape.lineTo(halfW - cutW, -halfD);
    shape.lineTo(halfW - cutW, -halfD + cutD);
    shape.lineTo(halfW, -halfD + cutD);
    shape.lineTo(halfW, halfD);
    shape.lineTo(-halfW, halfD);
    shape.closePath();

    const extruded = new THREE.ExtrudeGeometry(shape, { depth: heightM, bevelEnabled: false });
    // ExtrudeGeometry extrudes along +Z; rotate so it stands up along +Y instead.
    extruded.rotateX(-Math.PI / 2);
    return extruded;
  }, [item.widthMm, item.depthMm, item.lshapeCutout, heightM]);

  return (
    <mesh position={[x, 0, z]} rotation={[0, rotationY, 0]} geometry={geometry}>
      <meshStandardMaterial color={item.colorHex} />
    </mesh>
  );
}
