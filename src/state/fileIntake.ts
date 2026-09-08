// Shared file-intake handlers used by both the toolbar file pickers and drag-and-drop.

import { v4 as uuid } from 'uuid';
import { centeredImageOffsetMm } from '../core/geometry/imagePlacement';
import { fileToDownscaledDataUrl } from '../core/image/downscaleImage';
import { parseProjectJson } from './persistence';
import { useProjectStore } from './projectStore';
import { useToastStore } from './toastStore';

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'];

export function isReferenceImageFile(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
}

export function isProjectFile(file: File): boolean {
  return file.type === 'application/json' || /\.json$/i.test(file.name);
}

export async function importReferenceImageFile(file: File): Promise<void> {
  const { showToast } = useToastStore.getState();
  try {
    const { dataUrl, naturalWidthPx, naturalHeightPx } = await fileToDownscaledDataUrl(file);
    const pixelsPerMm = 1;

    useProjectStore.getState().addReferenceImage({
      id: uuid(),
      fileName: file.name,
      dataUrl,
      naturalWidthPx,
      naturalHeightPx,
      // Center the image on the grid origin until the user repositions it.
      offsetMm: centeredImageOffsetMm(naturalWidthPx, naturalHeightPx, pixelsPerMm),
      rotationDeg: 0,
      pixelsPerMm,
      opacity: 0.5,
      locked: false,
    });
  } catch {
    showToast(`Could not read image "${file.name}"`);
  }
}

export async function importProjectFile(file: File): Promise<void> {
  const { showToast } = useToastStore.getState();
  try {
    const result = parseProjectJson(await file.text());
    if (result.success) {
      useProjectStore.getState().setProject(result.project);
      showToast(`Imported "${result.project.name}"`);
    } else {
      showToast(result.error);
    }
  } catch {
    showToast(`Could not read file "${file.name}"`);
  }
}

/** Routes a dropped file to the reference-image or project importer based on its type. */
export async function importDroppedFile(file: File): Promise<void> {
  if (isReferenceImageFile(file)) {
    await importReferenceImageFile(file);
    return;
  }
  if (isProjectFile(file)) {
    await importProjectFile(file);
    return;
  }
  useToastStore.getState().showToast('Unsupported file. Drop a PNG, JPEG, or .json project.');
}
