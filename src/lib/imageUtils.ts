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
      
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ file, resized: false });
          return;
        }
        const ext = mimeType === 'image/png' ? '.png' : '.jpg';
        const newName = file.name.replace(/\.[^/.]+$/, "") + ext;
        const resizedFile = new File([blob], newName, { type: mimeType });
        resolve({ file: resizedFile, resized: true });
      }, mimeType, 0.9);
    };
    img.onerror = () => resolve({ file, resized: false });
    img.src = URL.createObjectURL(file);
  });
}
