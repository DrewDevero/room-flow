import { useRef } from 'react';
import { importReferenceImageFile } from '../../state/fileIntake';

export function AddReferenceImageButton() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await importReferenceImageFile(file);
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
        className="whitespace-nowrap rounded px-2 py-1 hover:bg-gray-100"
        onClick={() => inputRef.current?.click()}
      >
        <span className="hidden 2xl:inline">Add Reference Image</span>
        <span className="2xl:hidden">Image</span>
      </button>
    </>
  );
}
