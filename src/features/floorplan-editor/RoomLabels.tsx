import { Group, Text } from 'react-konva';
import type { Room, UnitSystem, Wall } from '../../core/model/types';
import { polygonAreaMm2, polygonCentroid, resolveRoomPolygon } from '../../core/geometry/walls';
import { formatArea } from '../../core/units/length';

interface RoomLabelsProps {
  rooms: Room[];
  walls: Wall[];
  unitSystem: UnitSystem;
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  zoom: number;
}

export function RoomLabels({
  rooms,
  walls,
  unitSystem,
  selectedRoomId,
  onSelectRoom,
  zoom,
}: RoomLabelsProps) {
  return (
    <>
      {rooms.map((room) => {
        const points = resolveRoomPolygon(room, walls);
        if (points.length < 3) return null;

        const centroid = polygonCentroid(points);
        const areaMm2 = polygonAreaMm2(points);

        return (
          <Group
            key={room.id}
            x={centroid.x}
            y={centroid.y}
            onClick={() => onSelectRoom(room.id)}
            onTap={() => onSelectRoom(room.id)}
          >
            <Text
              text={`${room.name}\n${formatArea(areaMm2, unitSystem)}`}
              fontSize={14 / zoom}
              fill={room.id === selectedRoomId ? '#2563eb' : '#111827'}
              align="center"
              offsetX={40 / zoom}
              width={80 / zoom}
            />
          </Group>
        );
      })}
    </>
  );
}
