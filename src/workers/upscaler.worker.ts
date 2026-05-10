// Real-ESRGAN upscaling via UpscalerJS with TF.js WASM backend
// Runs entirely off the main thread — no UI hang

import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import Upscaler from 'upscaler';

// ── Bootstrap: force WASM backend (avoids WebGL shader errors) ──
setWasmPaths(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@4.11.0/dist/'
);

let upscaler2x: Upscaler | null = null;
let upscaler4x: Upscaler | null = null;
let backendReady = false;

async function ensureBackend() {
  if (backendReady) return;
  await tf.setBackend('wasm');
  await tf.ready();
  backendReady = true;
}

async function getUpscaler(factor: 2 | 4) {
  await ensureBackend();
  if (factor === 2) {
    if (!upscaler2x) {
      const { default: x2 } = await import('@upscalerjs/esrgan-slim/2x');
      upscaler2x = new Upscaler({ model: x2 });
    }
    return upscaler2x;
  } else {
    if (!upscaler4x) {
      const { default: x4 } = await import('@upscalerjs/esrgan-slim/4x');
      upscaler4x = new Upscaler({ model: x4 });
    }
    return upscaler4x;
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { imageBuffer, factor } = event.data as {
    imageBuffer: ArrayBuffer;
    factor: 2 | 4;
  };

  try {
    self.postMessage({ type: 'progress', pct: 5, label: 'Initialising WASM backend…' });

    await ensureBackend();

    self.postMessage({ type: 'progress', pct: 12, label: 'Loading Real-ESRGAN model…' });

    const upscaler = await getUpscaler(factor);

    self.postMessage({ type: 'progress', pct: 30, label: 'Running Real-ESRGAN…' });

    // Convert ArrayBuffer → Blob → Object URL
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    // UpscalerJS returns a base64 data URL
    const result: string = await upscaler.upscale(url, {
      output: 'base64',
      patchSize: 64,
      padding: 4,
      progress: (pct: number) => {
        self.postMessage({
          type: 'progress',
          pct: 30 + pct * 0.58,
          label: `Real-ESRGAN: ${Math.round(pct * 100)}%`,
        });
      },
    });

    URL.revokeObjectURL(url);

    self.postMessage({ type: 'progress', pct: 92, label: 'Encoding…' });
    self.postMessage({ type: 'done', dataUrl: result });
  } catch (err: unknown) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
