import { useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { fileToDownscaledDataUrl } from '../../core/image/downscaleImage';
import { useProjectStore } from '../../state/projectStore';

export function AddReferenceImageButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const addReferenceImage = useProjectStore((s) => s.addReferenceImage);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const { dataUrl, naturalWidthPx, naturalHeightPx } = await fileToDownscaledDataUrl(file);

    addReferenceImage({
      id: uuid(),
      fileName: file.name,
      dataUrl,
      naturalWidthPx,
      naturalHeightPx,
      // Default scale of 1 image-px per mm until the user calibrates it.
      offsetMm: { x: 0, y: 0 },
      rotationDeg: 0,
      pixelsPerMm: 1,
      opacity: 0.5,
      locked: false,
    });
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <button
        type="button"
        className="rounded px-2 py-1 hover:bg-gray-100"
        onClick={() => inputRef.current?.click()}
      >
        Add Reference Image
      </button>
    </>
  );
}
