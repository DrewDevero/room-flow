import { useEffect, useRef, type Ref } from 'react';
import { Ellipse, Line, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { FurnitureInstance } from '../../core/model/types';

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
  const shapeRef = useRef<Konva.Shape | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (selected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  const strokeColor = overlapping ? '#dc2626' : selected ? '#2563eb' : 'rgba(0,0,0,0.2)';
  const strokeWidth = (overlapping || selected ? 2 : 1) / zoom;

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
      {item.shape === 'circle' && (
        <Ellipse
          ref={shapeRef as unknown as Ref<Konva.Ellipse>}
          {...commonProps}
          radiusX={item.widthMm / 2}
          radiusY={item.depthMm / 2}
        />
      )}

      {item.shape === 'rect' && (
        <Rect
          ref={shapeRef as unknown as Ref<Konva.Rect>}
          {...commonProps}
          width={item.widthMm}
          height={item.depthMm}
          offsetX={item.widthMm / 2}
          offsetY={item.depthMm / 2}
        />
      )}

      {item.shape === 'lshape' && (
        <Line
          ref={shapeRef as unknown as Ref<Konva.Line>}
          {...commonProps}
          points={buildLShapePoints(item)}
          closed
        />
      )}

      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
          rotateAnchorOffset={20 / zoom}
          enabledAnchors={
            item.shape === 'circle'
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
              : ['middle-left', 'middle-right', 'top-center', 'bottom-center']
          }
          keepRatio={item.shape === 'circle'}
          ignoreStroke
          flipEnabled={false}
          rotationSnapTolerance={snapEnabled ? 5 : 0}
        />
      )}
    </>
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
