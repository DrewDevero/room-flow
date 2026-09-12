import * as THREE from 'three';
import { useMemo } from 'react';
import type { FurnitureInstance } from '../../core/model/types';
import { getFurnitureAssetId } from '../../core/model/catalog';
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
  const widthM = mmToM(item.widthMm);
  const depthM = mmToM(item.depthMm);
  const heightM = mmToM(item.heightMm);
  const rotationY = toSceneRotationY(item.rotationDeg);
  const assetId = getFurnitureAssetId(item);

  switch (assetId) {
    case 'sofa-standard':
      return <Sofa3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'armchair':
      return <Armchair3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'dining-chair':
      return <DiningChair3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'bed-queen':
    case 'bed-twin':
      return <Bed3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'dining-table-rect':
    case 'desk':
    case 'work-desk':
      return <Table3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'coffee-table-round':
      return <RoundTable3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'dresser':
      return <Dresser3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'bookshelf':
      return <Bookshelf3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'refrigerator':
      return <Refrigerator3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'washer-dryer':
      return <WasherDryer3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'dish-washer':
      return <Dishwasher3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'stove':
      return <Stove3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'kitchen-sink':
    case 'bathroom-sink':
      return <Sink3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'toilet':
      return <Toilet3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'shower':
      return <Shower3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'closet':
      return <Closet3D item={item} x={x} z={z} widthM={widthM} depthM={depthM} heightM={heightM} rotationY={rotationY} />;
    case 'wardrobe-lshape':
      return <Wardrobe3D item={item} x={x} z={z} heightM={heightM} rotationY={rotationY} />;
  }

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

interface Furniture3DPartsProps {
  item: FurnitureInstance;
  x: number;
  z: number;
  widthM: number;
  depthM: number;
  heightM: number;
  rotationY: number;
}

function PartBox({
  color,
  position,
  size,
}: {
  color: string;
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.78} />
    </mesh>
  );
}

function PartCylinder({
  color,
  position,
  radius,
  depth,
  rotation = [0, 0, 0],
}: {
  color: string;
  position: [number, number, number];
  radius: number;
  depth: number;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, depth, 32]} />
      <meshStandardMaterial color={color} roughness={0.78} />
    </mesh>
  );
}

function legPositions(widthM: number, depthM: number, insetX: number, insetZ: number): [number, number][] {
  return [
    [-widthM / 2 + insetX, -depthM / 2 + insetZ],
    [widthM / 2 - insetX, -depthM / 2 + insetZ],
    [-widthM / 2 + insetX, depthM / 2 - insetZ],
    [widthM / 2 - insetX, depthM / 2 - insetZ],
  ];
}

function Sofa3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const armW = widthM * 0.12;
  const backD = depthM * 0.18;
  const seatH = heightM * 0.38;
  const cushionW = (widthM - armW * 2) / 3;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, seatH / 2, depthM * 0.08]} size={[widthM, seatH, depthM * 0.78]} />
      <PartBox color={item.colorHex} position={[0, heightM / 2, -depthM / 2 + backD / 2]} size={[widthM, heightM, backD]} />
      <PartBox color={item.colorHex} position={[-widthM / 2 + armW / 2, heightM * 0.34, 0]} size={[armW, heightM * 0.68, depthM]} />
      <PartBox color={item.colorHex} position={[widthM / 2 - armW / 2, heightM * 0.34, 0]} size={[armW, heightM * 0.68, depthM]} />
      {[0, 1, 2].map((index) => (
        <PartBox key={index} color="#dbeafe" position={[-cushionW + cushionW * index, seatH + heightM * 0.035, depthM * 0.12]} size={[cushionW * 0.92, heightM * 0.07, depthM * 0.54]} />
      ))}
    </group>
  );
}

function Armchair3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const armW = widthM * 0.2;
  const backD = depthM * 0.2;
  const seatH = heightM * 0.36;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, seatH / 2, depthM * 0.08]} size={[widthM, seatH, depthM * 0.74]} />
      <PartBox color={item.colorHex} position={[0, heightM / 2, -depthM / 2 + backD / 2]} size={[widthM, heightM, backD]} />
      <PartBox color={item.colorHex} position={[-widthM / 2 + armW / 2, heightM * 0.34, 0]} size={[armW, heightM * 0.68, depthM]} />
      <PartBox color={item.colorHex} position={[widthM / 2 - armW / 2, heightM * 0.34, 0]} size={[armW, heightM * 0.68, depthM]} />
      <PartBox color="#dbeafe" position={[0, seatH + heightM * 0.035, depthM * 0.12]} size={[widthM * 0.5, heightM * 0.07, depthM * 0.5]} />
    </group>
  );
}

function DiningChair3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const seatH = heightM * 0.45;
  const legW = Math.min(widthM, depthM) * 0.08;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, seatH, depthM * 0.08]} size={[widthM * 0.82, heightM * 0.08, depthM * 0.65]} />
      <PartBox color={item.colorHex} position={[0, heightM * 0.72, -depthM / 2 + depthM * 0.08]} size={[widthM * 0.82, heightM * 0.56, depthM * 0.12]} />
      {legPositions(widthM * 0.7, depthM * 0.5, widthM * 0.06, depthM * 0.04).map(([legX, legZ]) => (
        <PartBox key={`${legX}-${legZ}`} color={item.colorHex} position={[legX, seatH / 2, legZ + depthM * 0.12]} size={[legW, seatH, legW]} />
      ))}
    </group>
  );
}

function Bed3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const frameH = heightM * 0.22;
  const mattressH = heightM * 0.28;
  const headboardD = depthM * 0.08;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, frameH / 2, 0]} size={[widthM, frameH, depthM]} />
      <PartBox color="#f8fafc" position={[0, frameH + mattressH / 2, depthM * 0.04]} size={[widthM * 0.9, mattressH, depthM * 0.82]} />
      <PartBox color={item.colorHex} position={[0, heightM * 0.42, -depthM / 2 + headboardD / 2]} size={[widthM, heightM * 0.84, headboardD]} />
      <PartBox color="#e0f2fe" position={[-widthM * 0.24, frameH + mattressH + heightM * 0.035, -depthM * 0.28]} size={[widthM * 0.36, heightM * 0.07, depthM * 0.14]} />
      <PartBox color="#e0f2fe" position={[widthM * 0.24, frameH + mattressH + heightM * 0.035, -depthM * 0.28]} size={[widthM * 0.36, heightM * 0.07, depthM * 0.14]} />
    </group>
  );
}

function Table3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const topH = heightM * 0.1;
  const legW = Math.min(widthM, depthM) * 0.06;
  const assetId = getFurnitureAssetId(item);
  const isDesk = assetId === 'desk' || assetId === 'work-desk';
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM - topH / 2, 0]} size={[widthM, topH, depthM]} />
      {legPositions(widthM, depthM, widthM * 0.12, depthM * 0.16).map(([legX, legZ]) => (
        <PartBox key={`${legX}-${legZ}`} color={item.colorHex} position={[legX, (heightM - topH) / 2, legZ]} size={[legW, heightM - topH, legW]} />
      ))}
      {isDesk && <PartBox color="#92400e" position={[widthM * 0.3, (heightM - topH) / 2, 0]} size={[widthM * 0.22, heightM - topH, depthM * 0.72]} />}
      {assetId === 'work-desk' && <PartBox color="#dbeafe" position={[-widthM * 0.22, heightM + topH * 0.6, -depthM * 0.18]} size={[widthM * 0.28, topH * 0.7, depthM * 0.18]} />}
    </group>
  );
}

function RoundTable3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const topH = heightM * 0.12;
  const radius = Math.min(widthM, depthM) / 2;
  const legRadius = radius * 0.06;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, heightM - topH / 2, 0]} scale={[widthM / Math.max(depthM, 0.001), 1, 1]}>
        <cylinderGeometry args={[radius, radius, topH, 48]} />
        <meshStandardMaterial color={item.colorHex} roughness={0.78} />
      </mesh>
      {legPositions(widthM, depthM, widthM * 0.28, depthM * 0.28).map(([legX, legZ]) => (
        <PartCylinder key={`${legX}-${legZ}`} color={item.colorHex} position={[legX, (heightM - topH) / 2, legZ]} radius={legRadius} depth={heightM - topH} />
      ))}
    </group>
  );
}

function Dresser3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      {[0.22, 0.43, 0.64, 0.85].map((ratio) => (
        <PartBox key={ratio} color="#dcfce7" position={[0, heightM * ratio, depthM / 2 + 0.006]} size={[widthM * 0.86, heightM * 0.08, 0.012]} />
      ))}
      {[0.33, 0.54, 0.75].map((ratio) => (
        <PartBox key={ratio} color="#064e3b" position={[0, heightM * ratio, depthM / 2 + 0.014]} size={[widthM * 0.16, heightM * 0.025, 0.014]} />
      ))}
    </group>
  );
}

function Bookshelf3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const board = Math.min(widthM, depthM) * 0.08;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[-widthM / 2 + board / 2, heightM / 2, 0]} size={[board, heightM, depthM]} />
      <PartBox color={item.colorHex} position={[widthM / 2 - board / 2, heightM / 2, 0]} size={[board, heightM, depthM]} />
      <PartBox color={item.colorHex} position={[0, heightM - board / 2, 0]} size={[widthM, board, depthM]} />
      <PartBox color={item.colorHex} position={[0, board / 2, 0]} size={[widthM, board, depthM]} />
      {[0.25, 0.45, 0.65, 0.85].map((ratio) => (
        <PartBox key={ratio} color="#bbf7d0" position={[0, heightM * ratio, 0]} size={[widthM, board * 0.7, depthM]} />
      ))}
    </group>
  );
}

function Refrigerator3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#fdf2f8" position={[-widthM * 0.13, heightM / 2, depthM / 2 + 0.008]} size={[widthM * 0.02, heightM * 0.9, 0.016]} />
      <PartBox color="#831843" position={[-widthM * 0.22, heightM * 0.52, depthM / 2 + 0.018]} size={[widthM * 0.025, heightM * 0.5, 0.018]} />
      <PartBox color="#831843" position={[widthM * 0.2, heightM * 0.52, depthM / 2 + 0.018]} size={[widthM * 0.025, heightM * 0.5, 0.018]} />
    </group>
  );
}

function WasherDryer3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const doorRadius = Math.min(widthM, heightM) * 0.26;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#fdf2f8" position={[0, heightM * 0.86, depthM / 2 + 0.008]} size={[widthM * 0.9, heightM * 0.12, 0.016]} />
      <PartCylinder color="#fce7f3" position={[0, heightM * 0.45, depthM / 2 + 0.018]} radius={doorRadius} depth={0.02} rotation={[Math.PI / 2, 0, 0]} />
      <PartCylinder color="#831843" position={[0, heightM * 0.45, depthM / 2 + 0.032]} radius={doorRadius * 0.72} depth={0.01} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function Dishwasher3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#fdf2f8" position={[0, heightM * 0.86, depthM / 2 + 0.008]} size={[widthM * 0.9, heightM * 0.12, 0.016]} />
      <PartBox color="#831843" position={[0, heightM * 0.78, depthM / 2 + 0.018]} size={[widthM * 0.55, heightM * 0.025, 0.018]} />
      <PartBox color="#fdf2f8" position={[0, heightM * 0.52, depthM / 2 + 0.008]} size={[widthM * 0.8, heightM * 0.025, 0.016]} />
    </group>
  );
}

function Stove3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const burnerRadius = Math.min(widthM, depthM) * 0.1;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#fdf2f8" position={[0, heightM + 0.006, 0]} size={[widthM * 0.88, 0.012, depthM * 0.78]} />
      {legPositions(widthM * 0.58, depthM * 0.52, widthM * 0.02, depthM * 0.02).map(([burnerX, burnerZ]) => (
        <PartCylinder key={`${burnerX}-${burnerZ}`} color="#581c87" position={[burnerX, heightM + 0.018, burnerZ]} radius={burnerRadius} depth={0.018} />
      ))}
      <PartBox color="#831843" position={[0, heightM * 0.68, depthM / 2 + 0.018]} size={[widthM * 0.54, heightM * 0.025, 0.018]} />
    </group>
  );
}

function Sink3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const basinW = widthM * 0.58;
  const basinD = depthM * 0.48;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#eef2ff" position={[0, heightM + 0.006, depthM * 0.08]} size={[basinW, 0.012, basinD]} />
      <PartBox color="#312e81" position={[0, heightM + 0.018, depthM * 0.08]} size={[basinW * 0.58, 0.014, basinD * 0.52]} />
      <PartCylinder color="#1f2937" position={[0, heightM + 0.16, -depthM * 0.22]} radius={Math.min(widthM, depthM) * 0.025} depth={0.3} />
      <PartBox color="#1f2937" position={[widthM * 0.08, heightM + 0.29, -depthM * 0.16]} size={[widthM * 0.18, 0.035, depthM * 0.04]} />
    </group>
  );
}

function Toilet3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const bowlRadius = Math.min(widthM, depthM) * 0.3;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM * 0.34, -depthM * 0.34]} size={[widthM * 0.7, heightM * 0.68, depthM * 0.22]} />
      <PartCylinder color={item.colorHex} position={[0, heightM * 0.22, depthM * 0.1]} radius={bowlRadius} depth={heightM * 0.3} />
      <PartCylinder color="#fef3c7" position={[0, heightM * 0.38, depthM * 0.1]} radius={bowlRadius * 0.62} depth={heightM * 0.05} />
    </group>
  );
}

function Shower3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  const rail = Math.min(widthM, depthM) * 0.04;
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, 0.04, 0]} size={[widthM, 0.08, depthM]} />
      <PartBox color="#fef3c7" position={[0, heightM / 2, -depthM / 2 + rail / 2]} size={[widthM, heightM, rail]} />
      <PartBox color="#fef3c7" position={[-widthM / 2 + rail / 2, heightM / 2, 0]} size={[rail, heightM, depthM]} />
      <PartBox color="#fde68a" position={[widthM * 0.18, heightM * 0.55, depthM / 2 + 0.008]} size={[widthM * 0.46, heightM * 0.85, 0.016]} />
      <PartCylinder color="#451a03" position={[-widthM * 0.34, heightM * 0.78, -depthM * 0.42]} radius={rail * 0.8} depth={0.16} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function Closet3D({ item, x, z, widthM, depthM, heightM, rotationY }: Furniture3DPartsProps) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <PartBox color={item.colorHex} position={[0, heightM / 2, 0]} size={[widthM, heightM, depthM]} />
      <PartBox color="#dcfce7" position={[-widthM * 0.25, heightM * 0.5, depthM / 2 + 0.008]} size={[widthM * 0.46, heightM * 0.86, 0.016]} />
      <PartBox color="#dcfce7" position={[widthM * 0.25, heightM * 0.5, depthM / 2 + 0.008]} size={[widthM * 0.46, heightM * 0.86, 0.016]} />
      <PartBox color="#064e3b" position={[-widthM * 0.04, heightM * 0.52, depthM / 2 + 0.02]} size={[widthM * 0.035, heightM * 0.1, 0.02]} />
      <PartBox color="#064e3b" position={[widthM * 0.04, heightM * 0.52, depthM / 2 + 0.02]} size={[widthM * 0.035, heightM * 0.1, 0.02]} />
    </group>
  );
}

function Wardrobe3D({ item, x, z, heightM, rotationY }: { item: FurnitureInstance; x: number; z: number; heightM: number; rotationY: number }) {
  return (
    <group>
      <LShapeMesh3D item={item} x={x} z={z} heightM={heightM} rotationY={rotationY} />
      <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
        <PartBox color="#dcfce7" position={[0, heightM * 0.48, mmToM(item.depthMm) / 2 + 0.008]} size={[mmToM(item.widthMm) * 0.62, heightM * 0.82, 0.016]} />
      </group>
    </group>
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
