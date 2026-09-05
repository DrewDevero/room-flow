// Downloads a canvas/data URL as an image file (for 2D/3D "Save as Image").

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
