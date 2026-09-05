// Loads one of the bundled sample blueprints as a reference image, for
// onboarding/demo purposes (plan.md M6).

import { v4 as uuid } from 'uuid';
import { fileToDownscaledDataUrl } from '../core/image/downscaleImage';
import { useProjectStore } from './projectStore';

export type SampleFloorPlanType = 'studio' | 'oneBedroom' | 'twoBedroom';

const SAMPLE_IMAGE_URLS: Record<SampleFloorPlanType, string> = {
  studio: '/sample/sample_blueprint_studio.png',
  oneBedroom: '/sample/sample_blueprint_oneBedroom.png',
  twoBedroom: '/sample/sample_blueprint_twoBedroom.png',
};

export async function loadSampleReferenceImage(type: SampleFloorPlanType): Promise<void> {
  const url = SAMPLE_IMAGE_URLS[type];
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.split('/').pop() ?? `sample_blueprint_${type}.png`;
  const file = new File([blob], fileName, { type: blob.type || 'image/png' });

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
