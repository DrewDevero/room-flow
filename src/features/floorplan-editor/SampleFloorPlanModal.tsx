import type { SampleFloorPlanType } from '../../state/sampleProject';

interface SampleFloorPlanModalProps {
  onSelect: (type: SampleFloorPlanType) => void;
  onCancel: () => void;
}

const OPTIONS: { type: SampleFloorPlanType; label: string; description: string }[] = [
  { type: 'studio', label: 'Studio', description: 'Single open living space' },
  { type: 'oneBedroom', label: 'One Bedroom', description: 'Separate bedroom + living area' },
  { type: 'twoBedroom', label: 'Two Bedroom', description: 'Two separate bedrooms' },
];

export function SampleFloorPlanModal({ onSelect, onCancel }: SampleFloorPlanModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
      <div className="w-80 rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Load a sample blueprint</h2>
        <p className="mb-3 text-xs text-gray-500">Choose a floor plan to trace and furnish.</p>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              className="rounded border border-gray-300 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => onSelect(option.type)}
            >
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-gray-500">{option.description}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
