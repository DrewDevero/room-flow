import { useState } from 'react';
import { parseLength } from '../../core/units/length';
import type { Point2D, UnitSystem } from '../../core/model/types';
import { pixelDistance } from '../../core/geometry/calibration';

interface CalibrationModalProps {
  pointA: Point2D;
  pointB: Point2D;
  unitSystem: UnitSystem;
  onConfirm: (realWorldMm: number) => void;
  onCancel: () => void;
}

export function CalibrationModal({
  pointA,
  pointB,
  unitSystem,
  onConfirm,
  onCancel,
}: CalibrationModalProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mmDistance = pixelDistance(pointA, pointB);

  const handleConfirm = () => {
    const realWorldMm = parseLength(input, unitSystem);
    if (realWorldMm === null || realWorldMm <= 0) {
      setError('Enter a valid distance, e.g. 18\'-5" or 5.63m');
      return;
    }
    onConfirm(realWorldMm);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Calibrate scale</h2>
        <p className="mb-3 text-xs text-gray-500">
          Enter the real-world distance between the two points you selected
          ({mmDistance.toFixed(0)} working units apart).
        </p>
        <input
          autoFocus
          type="text"
          placeholder={unitSystem === 'imperial' ? "e.g. 18'-5\"" : 'e.g. 5.63m'}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onCancel();
          }}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700"
            onClick={handleConfirm}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
