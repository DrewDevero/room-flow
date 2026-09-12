import { useEffect, useRef, type Ref } from 'react';
import { Ellipse, Group, Line, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { FurnitureInstance } from '../../core/model/types';
import { getCatalogItem, getFurnitureAssetId } from '../../core/model/catalog';

interface FurnitureLayerProps {
  furniture: FurnitureInstance[];
  selectedId: string | null;
  overlappingIds: Set<string>;
  onSelect: (id: string) => void;
  onChange: (id: string, changes: Partial<FurnitureInstance>) => void;
  zoom: number;
  snapEnabled: boolean;
}

export function FurnitureLayer({
  furniture,
  selectedId,
  overlappingIds,
  onSelect,
  onChange,
  zoom,
  snapEnabled,
}: FurnitureLayerProps) {
  return (
    <>
      {furniture.map((item) => (
        <FurnitureShape
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          overlapping={overlappingIds.has(item.id)}
          onSelect={() => onSelect(item.id)}
          onChange={(changes) => onChange(item.id, changes)}
          zoom={zoom}
          snapEnabled={snapEnabled}
        />
      ))}
    </>
  );
}

function FurnitureShape({
  item,
  selected,
  overlapping,
  onSelect,
  onChange,
  zoom,
  snapEnabled,
}: {
  item: FurnitureInstance;
  selected: boolean;
  overlapping: boolean;
  onSelect: () => void;
  onChange: (changes: Partial<FurnitureInstance>) => void;
  zoom: number;
  snapEnabled: boolean;
}) {
  const shapeRef = useRef<Konva.Group | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  const strokeColor = overlapping ? '#dc2626' : selected ? '#2563eb' : 'rgba(0,0,0,0.2)';
  const strokeWidth = (overlapping || selected ? 2 : 1) / zoom;
  const assetShape = getCatalogItem(getFurnitureAssetId(item))?.shape ?? item.shape;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ position: { x: e.target.x(), y: e.target.y() } });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      widthMm: Math.max(10, item.widthMm * scaleX),
      depthMm: Math.max(10, item.depthMm * scaleY),
      rotationDeg: node.rotation(),
      position: { x: node.x(), y: node.y() },
    });
  };

  const commonProps = {
    x: item.position.x,
    y: item.position.y,
    rotation: item.rotationDeg,
    fill: item.colorHex,
    stroke: strokeColor,
    strokeWidth,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  return (
    <>
      <Group ref={shapeRef as unknown as Ref<Konva.Group>} {...commonProps}>
        <Rect
          x={-item.widthMm / 2}
          y={-item.depthMm / 2}
          width={item.widthMm}
          height={item.depthMm}
          fill="rgba(0,0,0,0)"
          strokeEnabled={false}
        />
        <FurnitureSymbol item={item} strokeColor={strokeColor} strokeWidth={strokeWidth} />
      </Group>

      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
          rotateAnchorOffset={20 / zoom}
          enabledAnchors={
            assetShape === 'circle'
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
              : ['middle-left', 'middle-right', 'top-center', 'bottom-center']
          }
          keepRatio={assetShape === 'circle'}
          ignoreStroke
          flipEnabled={false}
          rotationSnapTolerance={snapEnabled ? 5 : 0}
        />
      )}
    </>
  );
}

function FurnitureSymbol({
  item,
  strokeColor,
  strokeWidth,
}: {
  item: FurnitureInstance;
  strokeColor: string;
  strokeWidth: number;
}) {
  const width = item.widthMm;
  const depth = item.depthMm;
  const left = -width / 2;
  const top = -depth / 2;
  const detailStroke = 'rgba(255,255,255,0.78)';
  const darkDetailStroke = 'rgba(0,0,0,0.28)';
  const childProps = { listening: false, strokeScaleEnabled: false };
  const assetId = getFurnitureAssetId(item);
  const outlineProps = {
    ...childProps,
    fill: item.colorHex,
    stroke: strokeColor,
    strokeWidth,
  };

  switch (assetId) {
    case 'sofa-standard':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.09} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.24} fill="rgba(0,0,0,0.18)" />
          <Rect {...childProps} x={left} y={top} width={width * 0.14} height={depth} fill="rgba(0,0,0,0.14)" />
          <Rect {...childProps} x={left + width * 0.86} y={top} width={width * 0.14} height={depth} fill="rgba(0,0,0,0.14)" />
          <Line {...childProps} points={[left + width * 0.38, top + depth * 0.28, left + width * 0.38, top + depth * 0.88]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.62, top + depth * 0.28, left + width * 0.62, top + depth * 0.88]} stroke={detailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'armchair':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.1} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.24} fill="rgba(0,0,0,0.18)" />
          <Rect {...childProps} x={left} y={top} width={width * 0.22} height={depth} fill="rgba(0,0,0,0.14)" />
          <Rect {...childProps} x={left + width * 0.78} y={top} width={width * 0.22} height={depth} fill="rgba(0,0,0,0.14)" />
          <Rect {...childProps} x={left + width * 0.25} y={top + depth * 0.33} width={width * 0.5} height={depth * 0.47} fill="rgba(255,255,255,0.18)" cornerRadius={depth * 0.06} />
        </>
      );
    case 'dining-chair':
      return (
        <>
          <Rect {...outlineProps} x={left + width * 0.08} y={top + depth * 0.28} width={width * 0.84} height={depth * 0.58} cornerRadius={depth * 0.06} />
          <Rect {...childProps} x={left + width * 0.08} y={top} width={width * 0.84} height={depth * 0.22} fill={item.colorHex} stroke={strokeColor} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.2, top + depth * 0.22, left + width * 0.2, top + depth * 0.28, left + width * 0.8, top + depth * 0.28, left + width * 0.8, top + depth * 0.22]} stroke={darkDetailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'bed-queen':
    case 'bed-twin':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.035} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.12} fill="rgba(0,0,0,0.2)" />
          <Rect {...childProps} x={left + width * 0.08} y={top + depth * 0.16} width={width * 0.36} height={depth * 0.16} fill="rgba(255,255,255,0.38)" stroke={detailStroke} strokeWidth={strokeWidth} cornerRadius={depth * 0.025} />
          <Rect {...childProps} x={left + width * 0.56} y={top + depth * 0.16} width={width * 0.36} height={depth * 0.16} fill="rgba(255,255,255,0.38)" stroke={detailStroke} strokeWidth={strokeWidth} cornerRadius={depth * 0.025} />
          <Line {...childProps} points={[left + width * 0.08, top + depth * 0.38, left + width * 0.92, top + depth * 0.38]} stroke={detailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'dining-table-rect':
    case 'desk':
    case 'work-desk':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.04} />
          <Rect {...childProps} x={left + width * 0.08} y={top + depth * 0.12} width={width * 0.84} height={depth * 0.76} fill="rgba(255,255,255,0.16)" stroke={detailStroke} strokeWidth={strokeWidth} />
          {(assetId === 'desk' || assetId === 'work-desk') && <Rect {...childProps} x={left + width * 0.64} y={top + depth * 0.16} width={width * 0.24} height={depth * 0.68} fill="rgba(0,0,0,0.12)" />}
          {assetId === 'work-desk' && <Rect {...childProps} x={left + width * 0.14} y={top + depth * 0.16} width={width * 0.28} height={depth * 0.18} fill="rgba(255,255,255,0.28)" stroke={detailStroke} strokeWidth={strokeWidth} />}
          <Rect {...childProps} x={left + width * 0.1} y={top + depth * 0.14} width={width * 0.09} height={depth * 0.12} fill="rgba(0,0,0,0.2)" />
          <Rect {...childProps} x={left + width * 0.81} y={top + depth * 0.14} width={width * 0.09} height={depth * 0.12} fill="rgba(0,0,0,0.2)" />
          <Rect {...childProps} x={left + width * 0.1} y={top + depth * 0.74} width={width * 0.09} height={depth * 0.12} fill="rgba(0,0,0,0.2)" />
          <Rect {...childProps} x={left + width * 0.81} y={top + depth * 0.74} width={width * 0.09} height={depth * 0.12} fill="rgba(0,0,0,0.2)" />
        </>
      );
    case 'coffee-table-round':
      return (
        <>
          <Ellipse {...outlineProps} radiusX={width / 2} radiusY={depth / 2} />
          <Ellipse {...childProps} radiusX={width * 0.35} radiusY={depth * 0.35} fill="rgba(255,255,255,0.12)" stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.2, 0, left + width * 0.8, 0]} stroke={detailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'dresser':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.03} />
          {[0.28, 0.5, 0.72].map((ratio) => (
            <Line key={ratio} {...childProps} points={[left, top + depth * ratio, left + width, top + depth * ratio]} stroke={detailStroke} strokeWidth={strokeWidth} />
          ))}
          {[0.18, 0.39, 0.61, 0.82].map((ratio) => (
            <Line key={ratio} {...childProps} points={[left + width * 0.42, top + depth * ratio, left + width * 0.58, top + depth * ratio]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.4} />
          ))}
        </>
      );
    case 'bookshelf':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} />
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
            <Line key={ratio} {...childProps} points={[left, top + depth * ratio, left + width, top + depth * ratio]} stroke={detailStroke} strokeWidth={strokeWidth} />
          ))}
          <Line {...childProps} points={[left + width * 0.5, top, left + width * 0.5, top + depth]} stroke="rgba(0,0,0,0.14)" strokeWidth={strokeWidth} />
        </>
      );
    case 'refrigerator':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.025} />
          <Line {...childProps} points={[left + width * 0.52, top, left + width * 0.52, top + depth]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.43, top + depth * 0.16, left + width * 0.43, top + depth * 0.84]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.6} />
          <Line {...childProps} points={[left + width * 0.62, top + depth * 0.16, left + width * 0.62, top + depth * 0.84]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.6} />
        </>
      );
    case 'washer-dryer':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.04} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.18} fill="rgba(255,255,255,0.16)" />
          <Ellipse {...childProps} radiusX={width * 0.28} radiusY={depth * 0.28} y={depth * 0.08} fill="rgba(255,255,255,0.18)" stroke={detailStroke} strokeWidth={strokeWidth} />
          <Ellipse {...childProps} radiusX={width * 0.18} radiusY={depth * 0.18} y={depth * 0.08} stroke="rgba(0,0,0,0.2)" strokeWidth={strokeWidth} />
        </>
      );
    case 'dish-washer':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.035} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.18} fill="rgba(255,255,255,0.16)" />
          <Line {...childProps} points={[left + width * 0.16, top + depth * 0.36, left + width * 0.84, top + depth * 0.36]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.16, top + depth * 0.62, left + width * 0.84, top + depth * 0.62]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.22, top + depth * 0.11, left + width * 0.78, top + depth * 0.11]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.4} />
        </>
      );
    case 'stove':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.035} />
          <Rect {...childProps} x={left} y={top} width={width} height={depth * 0.18} fill="rgba(255,255,255,0.16)" />
          {[0.34, 0.66].map((xRatio) =>
            [0.42, 0.72].map((yRatio) => (
              <Ellipse key={`${xRatio}-${yRatio}`} {...childProps} x={left + width * xRatio} y={top + depth * yRatio} radiusX={width * 0.13} radiusY={depth * 0.13} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.3} />
            )),
          )}
        </>
      );
    case 'kitchen-sink':
    case 'bathroom-sink':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.04} />
          <Ellipse {...childProps} x={left + width * 0.5} y={top + depth * 0.56} radiusX={width * 0.32} radiusY={depth * 0.28} fill="rgba(255,255,255,0.22)" stroke={detailStroke} strokeWidth={strokeWidth} />
          <Ellipse {...childProps} x={left + width * 0.5} y={top + depth * 0.56} radiusX={width * 0.18} radiusY={depth * 0.14} stroke={darkDetailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.5, top + depth * 0.16, left + width * 0.5, top + depth * 0.32, left + width * 0.6, top + depth * 0.32]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.5} />
        </>
      );
    case 'toilet':
      return (
        <>
          <Rect {...outlineProps} x={left + width * 0.18} y={top} width={width * 0.64} height={depth * 0.3} cornerRadius={depth * 0.035} />
          <Ellipse {...childProps} y={top + depth * 0.58} radiusX={width * 0.34} radiusY={depth * 0.34} fill={item.colorHex} stroke={strokeColor} strokeWidth={strokeWidth} />
          <Ellipse {...childProps} y={top + depth * 0.58} radiusX={width * 0.2} radiusY={depth * 0.2} fill="rgba(255,255,255,0.22)" stroke={detailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'shower':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} cornerRadius={depth * 0.04} />
          <Line {...childProps} points={[left, top, left + width, top + depth]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width, top, left, top + depth]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Ellipse {...childProps} x={left + width * 0.14} y={top + depth * 0.24} radiusX={width * 0.045} radiusY={depth * 0.1} fill="rgba(255,255,255,0.28)" stroke={darkDetailStroke} strokeWidth={strokeWidth} />
        </>
      );
    case 'closet':
      return (
        <>
          <Rect {...outlineProps} x={left} y={top} width={width} height={depth} />
          <Line {...childProps} points={[left + width * 0.5, top, left + width * 0.5, top + depth]} stroke={detailStroke} strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.18, top + depth * 0.16, left + width * 0.18, top + depth * 0.84]} stroke="rgba(0,0,0,0.14)" strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.82, top + depth * 0.16, left + width * 0.82, top + depth * 0.84]} stroke="rgba(0,0,0,0.14)" strokeWidth={strokeWidth} />
          <Line {...childProps} points={[left + width * 0.43, top + depth * 0.5, left + width * 0.48, top + depth * 0.5]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.5} />
          <Line {...childProps} points={[left + width * 0.52, top + depth * 0.5, left + width * 0.57, top + depth * 0.5]} stroke={darkDetailStroke} strokeWidth={strokeWidth * 1.5} />
        </>
      );
    case 'wardrobe-lshape':
      return (
        <>
          <Line {...outlineProps} points={buildLShapePoints(item)} closed />
          <Line {...childProps} points={[left + width * 0.5, top, left + width * 0.5, top + depth * 0.5, left + width, top + depth * 0.5]} stroke={detailStroke} strokeWidth={strokeWidth} />
        </>
      );
    default:
      return <BasicFurnitureSymbol item={item} strokeColor={strokeColor} strokeWidth={strokeWidth} />;
  }
}

function BasicFurnitureSymbol({
  item,
  strokeColor,
  strokeWidth,
}: {
  item: FurnitureInstance;
  strokeColor: string;
  strokeWidth: number;
}) {
  if (item.shape === 'circle') {
    return (
      <Ellipse
        listening={false}
        strokeScaleEnabled={false}
        fill={item.colorHex}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        radiusX={item.widthMm / 2}
        radiusY={item.depthMm / 2}
      />
    );
  }

  if (item.shape === 'lshape') {
    return (
      <Line
        listening={false}
        strokeScaleEnabled={false}
        fill={item.colorHex}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        points={buildLShapePoints(item)}
        closed
      />
    );
  }

  return (
    <Rect
      listening={false}
      strokeScaleEnabled={false}
      fill={item.colorHex}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      x={-item.widthMm / 2}
      y={-item.depthMm / 2}
      width={item.widthMm}
      height={item.depthMm}
    />
  );
}

function buildLShapePoints(item: FurnitureInstance): number[] {
  const w = item.widthMm;
  const d = item.depthMm;
  const cutW = Math.min(item.lshapeCutout?.widthMm ?? w / 2, w);
  const cutD = Math.min(item.lshapeCutout?.depthMm ?? d / 2, d);
  const halfW = w / 2;
  const halfD = d / 2;

  // L-shape polygon (cutout in the top-right corner), centered on origin.
  return [
    -halfW, -halfD,
    halfW - cutW, -halfD,
    halfW - cutW, -halfD + cutD,
    halfW, -halfD + cutD,
    halfW, halfD,
    -halfW, halfD,
  ];
}
