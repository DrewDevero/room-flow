// Reads an image File, downscales it to a max dimension, and returns a data URL
// plus its natural pixel size (spec.md §8: bound embedded image size in exports).

export interface DownscaledImage {
  dataUrl: string;
  naturalWidthPx: number;
  naturalHeightPx: number;
}

export async function fileToDownscaledDataUrl(
  file: File,
  maxDimensionPx = 2000,
): Promise<DownscaledImage> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const scale = Math.min(1, maxDimensionPx / Math.max(image.width, image.height));
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  if (scale === 1) {
    return { dataUrl: originalDataUrl, naturalWidthPx: image.width, naturalHeightPx: image.height };
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: originalDataUrl, naturalWidthPx: image.width, naturalHeightPx: image.height };
  }
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return {
    dataUrl: canvas.toDataURL(file.type || 'image/png'),
    naturalWidthPx: targetWidth,
    naturalHeightPx: targetHeight,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}
