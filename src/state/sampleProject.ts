// Loads the bundled sample blueprint (assets/Room2105_bluprint.jpeg) as a
// reference image, for onboarding/demo purposes (plan.md M6).

import { v4 as uuid } from 'uuid';
import { fileToDownscaledDataUrl } from '../core/image/downscaleImage';
import { useProjectStore } from './projectStore';

const SAMPLE_IMAGE_URL = '/sample/Room2105_bluprint.jpeg';

export async function loadSampleReferenceImage(): Promise<void> {
  const response = await fetch(SAMPLE_IMAGE_URL);
  const blob = await response.blob();
  const file = new File([blob], 'Room2105_bluprint.jpeg', { type: blob.type || 'image/jpeg' });

  const { dataUrl, naturalWidthPx, naturalHeightPx } = await fileToDownscaledDataUrl(file);

  useProjectStore.getState().addReferenceImage({
    id: uuid(),
    fileName: file.name,
    dataUrl,
    naturalWidthPx,
    naturalHeightPx,
    offsetMm: { x: 0, y: 0 },
    rotationDeg: 0,
    pixelsPerMm: 1,
    opacity: 0.5,
    locked: false,
  });
}
