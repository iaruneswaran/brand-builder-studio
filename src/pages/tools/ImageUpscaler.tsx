import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Columns2,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import Upscaler from 'upscaler';
import x2Slim from '@upscalerjs/esrgan-slim/2x';
import x4Slim from '@upscalerjs/esrgan-slim/4x';
import { ensureSafeSize } from '@/lib/imageUtils';
import { toast } from 'sonner';

const CHECKER_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(45deg,#d4d4d4 25%,transparent 25%),' +
    'linear-gradient(-45deg,#d4d4d4 25%,transparent 25%),' +
    'linear-gradient(45deg,transparent 75%,#d4d4d4 75%),' +
    'linear-gradient(-45deg,transparent 75%,#d4d4d4 75%)',
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
  backgroundColor: '#e8e8e8',
};

/* ───────────────────────────────────────────────── */
/*  Constants                                         */
/* ───────────────────────────────────────────────── */

type Stage = 'idle' | 'processing' | 'done' | 'error';
type ScaleFactor = 2 | 4;

/* ───────────────────────────────────────────────── */
/*  Component                                         */
/* ───────────────────────────────────────────────── */

const ImageUpscaler: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Core state ──────────────────────────────────
  const [stage, setStage] = useState<Stage>('idle');
  const [progressLabel, setProgressLabel] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [imageNatW, setImageNatW] = useState(0);
  const [imageNatH, setImageNatH] = useState(0);
  const [progress, setProgress] = useState(0);

  // ── Tool state ──────────────────────────────────
  const [scaleFactor, setScaleFactor] = useState<ScaleFactor>(2);
  const [isDragging, setIsDragging] = useState(false);
  const [showComparison, setShowComparison] = useState(true);
  const [sliderPct, setSliderPct] = useState(50);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Resize listener for container-based scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height
        });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    // Warm up or skip - we are browser-side now
  }, []);

  /* ── result url management ── */
  useEffect(() => {
    if (!resultBlob) { setResultBlobUrl(null); return; }
    const url = URL.createObjectURL(resultBlob);
    setResultBlobUrl(url);

    // Get natural dimensions of result
    const img = new Image();
    img.onload = () => {
      setImageNatW(img.naturalWidth);
      setImageNatH(img.naturalHeight);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [resultBlob]);
  
  /* ── Auto-run upscale if scaleFactor changes while in done state ── */
  useEffect(() => {
    if (stage === 'done' && originalFile) {
        runUpscale(originalFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleFactor]);

  /* ── AI upscaling via browser-side library ── */
  const runUpscale = useCallback(async (file: File) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStage('processing');
    setProgressLabel('Initializing AI engine…');
    setProgress(0);
    setResultBlob(null);
    setErrorDetail('');

    // Create original preview
    const prevUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(prevUrl);

    try {
      setProgressLabel('Analyzing image size…');
      // Limit to 1024px for stable 2x/4x browser upscaling
      const { file: safeFile, resized } = await ensureSafeSize(file, 1024);
      if (resized) {
        toast.info('Image optimized for browser-side AI upscaling.', {
          description: 'Dimensions reduced to ensure stability during inference.'
        });
      }
      
      const safeUrl = URL.createObjectURL(safeFile);

      setProgressLabel('Optimizing browser inference (WebGL)…');
      
      const model = scaleFactor === 2 ? x2Slim : x4Slim;
      const upscaler = new Upscaler({ model });

      const result = await upscaler.upscale(safeUrl, {
        output: 'blob',
        signal: ac.signal,
        progress: (p: number) => {
          setProgress(+(p * 100).toFixed(1));
          setProgressLabel(`Upscaling ${scaleFactor}x details…`);
        }
      });

      URL.revokeObjectURL(safeUrl);

      if (ac.signal.aborted) return;

      if (!result || (result instanceof Blob && result.size === 0)) {
        throw new Error('AI engine returned an empty result.');
      }

      setResultBlob(result as Blob);
      setProgress(100);
      setStage('done');
    } catch (err: unknown) {
      if (ac.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setErrorDetail(`In-browser AI error: ${msg}`);
      setStage('error');
    } finally {
      setProgressLabel('');
    }
  }, [scaleFactor]);

  /* ── file input ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    runUpscale(file);
    e.target.value = '';
  };

  /* ── drag & drop ── */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setOriginalFile(file);
    runUpscale(file);
  };

  /* ── download ── */
  const handleDownload = () => {
    if (!resultBlobUrl) return;
    const a = document.createElement('a');
    a.href = resultBlobUrl;
    a.download = `upscaled_${scaleFactor}x_${Date.now()}.png`;
    a.click();
  };

  /* ── full reset ── */
  const handleReset = () => {
    abortRef.current?.abort();
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    setStage('idle');
    setOriginalFile(null);
    setOriginalPreviewUrl(null);
    setResultBlob(null);
    setProgressLabel('');
    setErrorDetail('');
  };

  /* ── render ── */
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-100 text-foreground select-none">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* ══ TOP BAR ══ */}
      <header className="shrink-0 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shadow-sm z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors px-1.5 py-1 rounded-md hover:bg-neutral-100"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-4 w-px bg-neutral-200" />

        <div className="flex items-center gap-2">
          <Maximize2 size={14} className="text-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">Image Upscaler</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200"
          title="Browser-side AI engine active"
        >
          <Sparkles size={9} />
          In-Browser Engine
        </div>

        <div className="flex-1" />

        {stage === 'done' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 border border-violet-100 rounded-lg">
               <span className="text-[10px] font-bold text-violet-600 uppercase tracking-tighter">Result: {imageNatW}x{imageNatH}</span>
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            {/* Scale Selector for Done stage */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-[10px] font-bold">
               {[2, 4].map(f => (
                 <button
                   key={f}
                   onClick={() => setScaleFactor(f as ScaleFactor)}
                   className={`px-3 py-1.5 transition-colors ${scaleFactor === f ? 'bg-violet-600 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                 >
                   {f}X
                 </button>
               ))}
            </div>

            <button
               onClick={() => setShowComparison(v => !v)}
               title="Before/After"
               className={`p-1.5 rounded transition-colors ${showComparison ? 'bg-violet-100 text-violet-600' : 'hover:bg-neutral-100 text-neutral-400'}`}
            >
              <Columns2 size={13} />
            </button>

            <div className="h-4 w-px bg-neutral-200" />

            <button
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ImageIcon size={11} /> New
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
            >
              <Download size={11} /> Export High-Res
            </button>
          </div>
        )}

        {stage !== 'idle' && stage !== 'done' && (
          <button onClick={handleReset} title="Start over" className="p-1.5 ml-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700">
            <ArrowLeft size={13} />
          </button>
        )}
      </header>

      {/* ══ MAIN AREA ══ */}
      <main
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden flex flex-col"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">

          {/* ── Idle ── */}
          {stage === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 bg-neutral-50 p-6"
            >
              {isDragging && (
                <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-violet-400 bg-violet-50/70 z-10 flex items-center justify-center pointer-events-none">
                  <p className="text-sm font-bold text-violet-600">Drop image here</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-5 max-w-sm">
                <motion.div
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-colors shadow-sm"
                >
                  <Upload size={32} />
                </motion.div>

                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-neutral-800">Upscale your images instantly</p>
                  <p className="text-xs text-neutral-400">Increase resolution by 2x or 4x with AI sharpening</p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  {[2, 4].map(f => (
                    <button
                      key={f}
                      onClick={() => setScaleFactor(f as ScaleFactor)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        scaleFactor === f
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-violet-300'
                      }`}
                    >
                      {f}X Scale
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
                >
                  <Upload size={13} /> Choose Image
                </button>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-500 shadow-sm">
                <Maximize2 size={11} className="text-violet-500" />
                Lanczos Resampling · Edge Sharpening · High Fidelity
              </div>
            </motion.div>
          )}

          {/* ── Processing ── */}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 bg-neutral-50"
            >
              {/* Scanning dots */}
              <div className="flex gap-2 items-center">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-500"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.0,
                      delay: i * 0.18,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              {/* Completing percentage count */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <span className="text-[0.875rem] leading-[1.25rem] font-medium text-violet-600 tabular-nums">
                  {Math.round(progress)}%
                </span>
              </motion.div>

              {originalFile && (
                <p className="text-[10px] text-neutral-400 font-medium truncate max-w-[220px] px-4 text-center">
                  📎 {originalFile.name}
                </p>
              )}

              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-neutral-800">{progressLabel || 'Enhancing image details…'}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{scaleFactor}x Upscale · AI processing may take a minute</p>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-5 bg-neutral-50"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <div className="text-center space-y-2 max-w-sm px-6">
                <p className="text-sm font-bold text-neutral-800">Upscaling failed</p>
                <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-line">{errorDetail}</p>
              </div>

              <div className="bg-violet-900 text-violet-100 rounded-xl px-5 py-3 text-[11px] font-mono leading-relaxed max-w-xs text-center opacity-80">
                <p className="font-bold text-violet-400 mb-1">In-Browser AI Tip:</p>
                <p>Large images may slow down your browser. Works best with images up to 1024px.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={handleReset} className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Done ── */}
          {stage === 'done' && resultBlobUrl && originalPreviewUrl && imageNatW > 0 && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center bg-neutral-900 p-6 overflow-hidden"
            >
              {(() => {
                const w = imageNatW || 800;
                const h = imageNatH || 600;
                const maxW = (containerSize.w || 800) * 0.95;
                const maxH = (containerSize.h || 600) * 0.90;
                const scale = Math.min(1, maxW / w, maxH / h);
                const dw = Math.round(w * scale);
                const dh = Math.round(h * scale);

                return (
                  <div 
                    className="relative select-none rounded-xl overflow-hidden shadow-2xl bg-neutral-800 border border-neutral-700 pointer-events-auto"
                    style={{ width: dw, height: dh, cursor: showComparison ? 'col-resize' : 'default' }}
                    onPointerDown={(e) => {
                      if (!showComparison) return;
                      e.currentTarget.setPointerCapture(e.pointerId);
                      const r = e.currentTarget.getBoundingClientRect();
                      setSliderPct(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
                    }}
                    onPointerMove={(e) => {
                      if (!showComparison) return;
                      // Use e.buttons for mouse or just rely on pointerCapture for touch
                      if (e.pointerType === 'mouse' && e.buttons !== 1) return;
                      
                      const r = e.currentTarget.getBoundingClientRect();
                      setSliderPct(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
                    }}
                  >
                    {/* Result (Base) */}
                    <img
                      src={resultBlobUrl}
                      alt="Upscaled"
                      draggable={false}
                      className="absolute inset-0 w-full h-full"
                      style={{ objectFit: 'fill', imageRendering: 'auto' }}
                    />

                    {showComparison && (
                      <>
                        {/* Original (Clipped) */}
                        <div
                          className="absolute inset-0 w-full h-full overflow-hidden"
                          style={{ 
                            clipPath: `inset(0 ${100 - sliderPct}% 0 0)`,
                            backgroundColor: '#222'
                          }}
                        >
                          <img
                            src={originalPreviewUrl}
                            alt="Original"
                            draggable={false}
                            className="w-full h-full"
                            style={{ objectFit: 'fill', imageRendering: 'pixelated' }}
                          />
                        </div>

                        {/* Divider */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                          style={{ left: `${sliderPct}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-violet-200 flex items-center justify-center pointer-events-none"
                          style={{ left: `${sliderPct}%` }}
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M6 9H1M1 9L3.5 6.5M1 9L3.5 11.5M12 9H17M17 9L14.5 6.5M17 9L14.5 11.5" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>

                        {/* Labels */}
                        <div className="absolute top-4 left-4 flex flex-col gap-1">
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg tracking-widest border border-white/10 uppercase">Original</span>
                        </div>
                      </>
                    )}

                    <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                      <span className="px-2.5 py-1 bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg tracking-widest border border-white/10 uppercase">{scaleFactor}X Powered</span>
                      <span className="text-[10px] font-bold text-white/40">{imageNatW} x {imageNatH}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-6 flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  Upscaling Complete
                </div>
                {showComparison && <span>Drag the slider to compare details</span>}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default ImageUpscaler;
