// Loads one of the bundled sample blueprints as a reference image, for
// onboarding/demo purposes (plan.md M6).

import { v4 as uuid } from 'uuid';
import { fileToDownscaledDataUrl } from '../core/image/downscaleImage';
import { centeredImageOffsetMm } from '../core/geometry/imagePlacement';
import { useProjectStore } from './projectStore';

export type SampleFloorPlanType = 'studio' | 'oneBedroom' | 'twoBedroom';

const SAMPLE_IMAGE_FILENAMES: Record<SampleFloorPlanType, string> = {
  studio: 'sample_blueprint_studio.png',
  oneBedroom: 'sample_blueprint_oneBedroom.png',
  twoBedroom: 'sample_blueprint_twoBedroom.png',
};

export async function loadSampleReferenceImage(type: SampleFloorPlanType): Promise<void> {
  // Build the URL relative to the app's base path (e.g. "/room-flow/" on
  // GitHub Pages) rather than assuming the site is served from "/".
  const fileName = SAMPLE_IMAGE_FILENAMES[type];
  const url = `${import.meta.env.BASE_URL}sample/${fileName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load sample blueprint (${response.status}).`);
  }
  const blob = await response.blob();
  const file = new File([blob], fileName, { type: blob.type || 'image/png' });

  const { dataUrl, naturalWidthPx, naturalHeightPx } = await fileToDownscaledDataUrl(file);
  const pixelsPerMm = 1;

  useProjectStore.getState().addReferenceImage({
    id: uuid(),
    fileName: file.name,
    dataUrl,
    naturalWidthPx,
    naturalHeightPx,
    offsetMm: centeredImageOffsetMm(naturalWidthPx, naturalHeightPx, pixelsPerMm),
    rotationDeg: 0,
    pixelsPerMm,
    opacity: 0.5,
    locked: false,
  });
}
