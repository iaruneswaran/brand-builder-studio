/**
 * imageUtils.ts
 * Utilities for browser-side image processing.
 */

/**
 * Resize an image if it exceeds a maximum dimension.
 * Maintains aspect ratio.
 */
export async function ensureSafeSize(file: File, maxDim: number = 1500): Promise<{ file: File; resized: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve({ file, resized: false });
        return;
      }

      const ratio = Math.min(maxDim / width, maxDim / height);
      const newW = Math.round(width * ratio);
      const newH = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ file, resized: false });
        return;
      }

      ctx.drawImage(img, 0, 0, newW, newH);
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ file, resized: false });
          return;
        }
        const resizedFile = new File([blob], file.name, { type: file.type });
        resolve({ file: resizedFile, resized: true });
      }, file.type, 0.9);
    };
    img.onerror = () => resolve({ file, resized: false });
    img.src = URL.createObjectURL(file);
  });
}
