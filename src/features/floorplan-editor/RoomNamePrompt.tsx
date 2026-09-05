import { useState } from 'react';

interface RoomNamePromptProps {
  defaultName?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function RoomNamePrompt({ defaultName = 'Room', onConfirm, onCancel }: RoomNamePromptProps) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
      <div className="w-72 rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-1 text-sm font-semibold text-gray-900">Name this room</h2>
        <p className="mb-3 text-xs text-gray-500">
          The wall loop you drew is closed. Give this room a name.
        </p>
        <input
          autoFocus
          type="text"
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(name.trim() || defaultName);
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-3 py-1 text-sm hover:bg-gray-100"
            onClick={onCancel}
          >
            Skip
          </button>
          <button
            type="button"
            className="rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700"
            onClick={() => onConfirm(name.trim() || defaultName)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
