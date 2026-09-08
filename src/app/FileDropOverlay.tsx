import { useEffect, useRef, useState } from 'react';
import { importDroppedFile } from '../state/fileIntake';

function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

/** Full-window drop target for reference images (PNG/JPEG) and project files (.json). */
export function FileDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  // Drag events fire for every child element, so track nesting depth to know when we truly left.
  const dragDepth = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setIsDragging(true);
    };

    const handleDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      for (const file of files) {
        void importDroppedFile(file);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  if (!isDragging) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10 p-6"
      aria-hidden="true"
    >
      <div className="rounded-lg border-2 border-dashed border-blue-500 bg-white/90 px-8 py-6 text-center shadow-lg">
        <p className="text-sm font-medium text-gray-900">Drop to add to this project</p>
        <p className="mt-1 text-xs text-gray-500">
          PNG or JPEG becomes a reference image · .json replaces the project
        </p>
      </div>
    </div>
  );
}
