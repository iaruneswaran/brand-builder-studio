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
  Layers,
  Download,
  Eraser,
  Undo2,
  Redo2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Paintbrush,
  Image as ImageIcon,
  Columns2,
  Wand2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { removeBackground, Config } from '@imgly/background-removal';
import { ensureSafeSize } from '@/lib/imageUtils';
import { toast } from 'sonner';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  Constants                                                  */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

// Using local browser-side inference via @imgly/background-removal
// No backend server required for this tool.

type Stage = 'idle' | 'processing' | 'done' | 'error';
type BrushMode = 'erase' | 'restore';
type BgPreview = 'transparent' | 'white' | 'black' | 'custom';

const QUALITY_MODELS = [
  { id: 'isnet_quint8', label: 'Balanced', desc: 'Fast and high quality' },
  { id: 'isnet',        label: 'High Quality', desc: 'Slower, more precise' },
] as const;

type ModelId = typeof QUALITY_MODELS[number]['id'];

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

const PREVIEW_BG: Record<BgPreview, React.CSSProperties> = {
  transparent: CHECKER_STYLE,
  white: { backgroundColor: '#ffffff' },
  black: { backgroundColor: '#111111' },
  custom: {},
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/*  Component                                                  */
/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const BackgroundRemover: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use a mutable ref for canvas (shared with callback ref)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // canvasReady becomes true the moment the <canvas> is physically in the DOM
  // (fires AFTER AnimatePresence mounts it, solving the mode="wait" timing bug)
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasCallbackRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    setCanvasReady(!!node);
  }, []);
  const cleanImgRef = useRef<HTMLImageElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // â”€â”€ Core state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [stage, setStage] = useState<Stage>('idle');
  const [progressLabel, setProgressLabel] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  // Stable object URL for the processed result â€” used by comparison img tag
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState('');
  // Natural pixel dimensions of the processed image â€” stable across comparison toggle
  const [imageNatW, setImageNatW] = useState(0);
  const [imageNatH, setImageNatH] = useState(0);

  // â”€â”€ Tool state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [brushSize, setBrushSize] = useState(30);
  const [brushMode, setBrushMode] = useState<BrushMode>('erase');
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [bgPreview, setBgPreview] = useState<BgPreview>('transparent');
  const [customBgColor, setCustomBgColor] = useState('#6d28d9');
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);
  // ── Quality / model ────────────────────────────────────────────────
  const [qualityModel, setQualityModel] = useState<ModelId>('isnet_quint8');
  const [alphaMat, setAlphaMat] = useState(true);

  // â”€â”€ Undo / redo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const undoStack = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  /* â”€ stack helpers â”€â”€ */
  const syncStack = () => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  };

  const snapCanvas = () => {
    const c = canvasRef.current;
    if (!c) return null;
    return c.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, c.width, c.height);
  };

  const applySnap = (snap: ImageData) => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext('2d', { willReadFrequently: true })!.putImageData(snap, 0, 0);
  };

  const pushUndo = useCallback(() => {
    const s = snapCanvas();
    if (!s) return;
    undoStack.current.push(s);
    redoStack.current = [];
    syncStack();
  }, []);

  const handleUndo = useCallback(() => {
    if (!undoStack.current.length) return;
    const cur = snapCanvas();
    if (cur) redoStack.current.push(cur);
    applySnap(undoStack.current.pop()!);
    syncStack();
  }, []);

  const handleRedo = useCallback(() => {
    if (!redoStack.current.length) return;
    const cur = snapCanvas();
    if (cur) undoStack.current.push(cur);
    applySnap(redoStack.current.pop()!);
    syncStack();
  }, []);

  /* â”€ keyboard shortcuts â”€â”€ */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (stage !== 'done') return;
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [stage, handleUndo, handleRedo]);



  /* â”€ create/revoke a stable object URL for the result blob â”€â”€
     Used by the comparison <img> so AFTER side never goes blank  */
  useEffect(() => {
    if (!resultBlob) { setResultBlobUrl(null); return; }
    const url = URL.createObjectURL(resultBlob);
    setResultBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resultBlob]);

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   *  THE FIX: draw blob to canvas only when canvasReady=true, meaning
   *  the <canvas> element is physically in the DOM.
   *
   *  Root cause of blank canvas:
   *  AnimatePresence mode="wait" delays mounting the entering component
   *  until the exiting component finishes its exit animation.
   *  useEffect([stage, resultBlob]) fires immediately after the state
   *  update but BEFORE the canvas mounts â†’ canvasRef.current === null
   *  â†’ drawing silently skipped â†’ canvas stays blank forever.
   *
   *  Solution: canvasCallbackRef fires setCanvasReady(true) when the
   *  canvas enters the DOM. This effect re-runs at that exact moment.
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    if (!canvasReady || !resultBlob || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const url = URL.createObjectURL(resultBlob);
    const img = new Image();

    img.onload = () => {
      if (!canvasRef.current) { URL.revokeObjectURL(url); return; }
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      setImageNatW(img.naturalWidth);
      setImageNatH(img.naturalHeight);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      cleanImgRef.current = img;
      undoStack.current = [];
      redoStack.current = [];
      syncStack();
      URL.revokeObjectURL(url);
      console.info('[BG Remover] Canvas drawn:', canvas.width, 'x', canvas.height);
    };

    img.onerror = (e) => {
      console.error('[BG Remover] Failed to load result image:', e);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasReady, resultBlob]);

  /* ── AI removal via browser-side library ── */
  const runRemoval = useCallback(async (file: File) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStage('processing');
    setProgressLabel('Initializing AI engine…');
    setResultBlob(null);
    setErrorDetail('');
    cleanImgRef.current = null;
    undoStack.current = [];
    redoStack.current = [];
    syncStack();

    // Create original preview
    const prevUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(prevUrl);

    try {
      setProgressLabel('Analyzing image size…');
      const { file: safeFile, resized } = await ensureSafeSize(file, 2048); 
      if (resized) {
        toast.info('Image optimized for faster in-browser AI processing.', {
          description: 'Dimensions reduced to maintain performance.'
        });
      }

      setProgressLabel('Removing background (In-Browser AI)…');
      
      const config: Config = {
        progress: (status: string, progress: number) => {
          setProgressLabel(`${status} (${Math.round(progress * 100)}%)`);
        },
        model: qualityModel as any,
      };

      // @ts-ignore - removeBackground can handle File/Blob
      const result = await removeBackground(safeFile, config);

      if (ac.signal.aborted) return;

      if (!result || (result instanceof Blob && result.size === 0)) {
        throw new Error('AI engine returned an empty result.');
      }

      console.info(`[BG Remover] Browser result: ${result.type}, ${(result.size / 1024).toFixed(1)} KB`);

      setResultBlob(result);
      setStage('done');
      setZoom(1);
      setShowComparison(false);
    } catch (err: unknown) {
      if (ac.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[BG Remover] Error:', msg);
      setErrorDetail(`Browser-side AI error: ${msg}`);
      setStage('error');
    } finally {
      setProgressLabel('');
    }
  }, []);

  /* â”€ file input â”€â”€ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    runRemoval(file);
    e.target.value = '';
  };

  /* â”€ drag & drop â”€â”€ */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setOriginalFile(file);
    runRemoval(file);
  };

  /* â”€ canvas pointer helpers â”€â”€ */
  const getXY = (clientX: number, clientY: number) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((clientX - r.left) * c.width) / r.width, y: ((clientY - r.top) * c.height) / r.height };
  };

  /* â”€ brush â”€â”€ */
  const paintBrush = useCallback(
    (x: number, y: number, fromX?: number, fromY?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const r = brushSize;

      if (brushMode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = r * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (fromX !== undefined && fromY !== undefined) {
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else {
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      } else {
        const img = cleanImgRef.current;
        if (!img) return;
        const steps = Math.max(1, Math.ceil(Math.hypot(x - fromX!, y - fromY!) / (r * 0.4)));
        const points: Array<{ px: number; py: number }> =
          fromX !== undefined && fromY !== undefined
            ? Array.from({ length: steps + 1 }, (_, i) => ({
                px: fromX! + (x - fromX!) * (i / steps),
                py: fromY! + (y - fromY!) * (i / steps),
              }))
            : [{ px: x, py: y }];

        for (const { px, py } of points) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    },
    [brushMode, brushSize]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (stage !== 'done') return;
      e.preventDefault();
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      pushUndo();
      isDrawing.current = true;
      const pos = getXY(e.clientX, e.clientY);
      lastPos.current = pos;
      paintBrush(pos.x, pos.y);
    },
    [stage, pushUndo, paintBrush]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      e.preventDefault();
      const pos = getXY(e.clientX, e.clientY);
      paintBrush(pos.x, pos.y, lastPos.current?.x, lastPos.current?.y);
      lastPos.current = pos;
    },
    [paintBrush]
  );

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  /* â”€ download â”€â”€ */
  const handleDownload = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bg-removed_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  };

  /* â”€ restore AI result â”€â”€ */
  const handleRestoreAI = () => {
    if (!resultBlob || !canvasRef.current) return;
    pushUndo();
    const url = URL.createObjectURL(resultBlob);
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      if (!c) { URL.revokeObjectURL(url); return; }
      c.getContext('2d', { willReadFrequently: true })!.clearRect(0, 0, c.width, c.height);
      c.getContext('2d', { willReadFrequently: true })!.drawImage(img, 0, 0);
      cleanImgRef.current = img;
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  /* â”€ full reset â”€â”€ */
  const handleReset = () => {
    abortRef.current?.abort();
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    setStage('idle');
    setOriginalFile(null);
    setOriginalPreviewUrl(null);
    setResultBlob(null);
    cleanImgRef.current = null;
    setProgressLabel('');
    setErrorDetail('');
    setZoom(1);
    setShowComparison(false);
    undoStack.current = [];
    redoStack.current = [];
    syncStack();
  };

  const clampZoom = (v: number) => Math.min(4, Math.max(0.2, v));

  /* â”€ comparison slider drag â”€â”€ */
  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSliderPct(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };

  /* â”€ active canvas background style â”€â”€ */
  const canvasBgStyle: React.CSSProperties =
    bgPreview === 'custom'
      ? { backgroundColor: customBgColor }
      : PREVIEW_BG[bgPreview];

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-100 text-foreground select-none">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• TOP BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
          <Layers size={14} className="text-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">Background Remover</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-200"
          title="Browser-side AI engine active"
        >
          <Sparkles size={9} />
          In-Browser Engine
        </div>

        <div className="flex-1" />

        {/* â”€â”€ Done-only controls â”€â”€ */}
        {stage === 'done' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Brush mode */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden text-[10px] font-bold">
              <button
                onClick={() => setBrushMode('erase')}
                className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${brushMode === 'erase' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
              >
                <Eraser size={11} /> Erase
              </button>
              <button
                onClick={() => setBrushMode('restore')}
                className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${brushMode === 'restore' ? 'bg-violet-600 text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
              >
                <Paintbrush size={11} /> Restore
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <div className="h-4 w-px bg-neutral-200" />
              <span className="text-[10px] font-bold text-neutral-400">Size {brushSize}</span>
              <Slider value={[brushSize]} min={4} max={120} step={1} onValueChange={(v) => setBrushSize(v[0])} className="w-24" />
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            {/* Background preview selector */}
            <div className="flex items-center gap-1">
              {(['transparent', 'white', 'black'] as BgPreview[]).map((bg) => (
                <button
                  key={bg}
                  title={`Preview on ${bg}`}
                  onClick={() => setBgPreview(bg)}
                  className={`w-5 h-5 rounded border-2 transition-all ${bgPreview === bg ? 'border-violet-500 scale-110' : 'border-neutral-300 hover:border-neutral-500'}`}
                  style={bg === 'transparent' ? CHECKER_STYLE : { backgroundColor: bg === 'white' ? '#fff' : '#111' }}
                />
              ))}
              {/* Custom color */}
              <div className={`relative w-5 h-5 rounded border-2 overflow-hidden ${bgPreview === 'custom' ? 'border-violet-500 scale-110' : 'border-neutral-300'}`}>
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => { setCustomBgColor(e.target.value); setBgPreview('custom'); }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Custom background color"
                />
                <div className="w-full h-full" style={{ backgroundColor: customBgColor }} />
              </div>
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            {/* Before/After toggle */}
            <button
              onClick={() => setShowComparison((v) => !v)}
              title="Before/After comparison"
              className={`p-1.5 rounded transition-colors ${showComparison ? 'bg-violet-100 text-violet-600' : 'hover:bg-neutral-100 text-neutral-500'}`}
            >
              <Columns2 size={13} />
            </button>

            <div className="h-4 w-px bg-neutral-200" />

            {/* Zoom */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => setZoom((z) => clampZoom(z - 0.25))} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500" title="Zoom out"><ZoomOut size={13} /></button>
              <span className="text-[10px] font-bold text-neutral-400 w-9 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => clampZoom(z + 0.25))} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500" title="Zoom in"><ZoomIn size={13} /></button>
            </div>

            <div className="h-4 w-px bg-neutral-200" />

            {/* Undo / Redo */}
            <button onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30"><Undo2 size={13} /></button>
            <button onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)" className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 disabled:opacity-30"><Redo2 size={13} /></button>

            <div className="h-4 w-px bg-neutral-200" />

            <button onClick={handleRestoreAI} title="Restore AI result" className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"><RefreshCw size={13} /></button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-neutral-600 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"><ImageIcon size={11} /> New</button>
            <button onClick={handleDownload} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"><Download size={11} /> Export PNG</button>
          </div>
        )}

        {stage !== 'idle' && (
          <button onClick={handleReset} title="Start over" className="p-1.5 ml-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700">
            <ArrowLeft size={13} />
          </button>
        )}
      </header>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â• MAIN AREA â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <main
        className="flex-1 min-h-0 relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <AnimatePresence>

          {/* â”€â”€ Idle â”€â”€ */}
          {stage === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-neutral-50"
            >
              {isDragging && (
                <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-violet-400 bg-violet-50/70 z-10 flex items-center justify-center pointer-events-none">
                  <p className="text-sm font-bold text-violet-600">Drop image here</p>
                </div>
              )}



              <motion.div
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-colors shadow-sm"
              >
                <Upload size={36} />
              </motion.div>

              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-neutral-800">Drop an image or click to upload</p>
                <p className="text-xs text-neutral-400">JPG Â· PNG Â· WebP Â· GIF â€” AI removes background locally</p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
              >
                <Upload size={13} /> Choose Image
              </button>

              {/* Model selector */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Quality Model</p>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {QUALITY_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setQualityModel(m.id)}
                      title={m.desc}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        qualityModel === m.id
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:border-violet-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setAlphaMat((v) => !v)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      alphaMat ? 'bg-violet-600' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                      alphaMat ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-500">Enable advanced processing</span>
                </label>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-full text-[10px] font-semibold text-neutral-500 shadow-sm">
                <Sparkles size={11} className="text-violet-500" />
                Fog-free Â· Sharp edges Â· Runs 100% locally Â· Free
              </div>
            </motion.div>
          )}

          {/* â”€â”€ Processing â”€â”€ */}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-neutral-50"
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

              {originalFile && (
                <p className="text-[10px] text-neutral-400 font-medium truncate max-w-[220px] px-4 text-center">
                  ðŸ“Ž {originalFile.name}
                </p>
              )}

              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-neutral-800">{progressLabel || 'Removing backgroundâ€¦'}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">BiRefNet AI Â· fog-free edges</p>
              </div>
            </motion.div>
          )}


          {/* â”€â”€ Error â”€â”€ */}
          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-neutral-50"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <div className="text-center space-y-2 max-w-sm px-6">
                <p className="text-sm font-bold text-neutral-800">Background removal failed</p>
                <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-line">{errorDetail}</p>
              </div>

              <div className="flex gap-2">
                {originalFile && (
                  <button onClick={() => runRemoval(originalFile)} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors">
                    <RefreshCw size={12} /> Retry
                  </button>
                )}
                <button onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-neutral-200 text-xs font-bold text-neutral-600 rounded-lg hover:bg-neutral-50">
                  Start over
                </button>
              </div>
            </motion.div>
          )}

          {/* â•â• Done â•â• */}
          {stage === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 overflow-auto"
              style={showComparison ? { backgroundColor: '#111' } : canvasBgStyle}
            >
              <div className="min-w-full min-h-full flex items-center justify-center p-6">

                {/* â•â• Before/After comparison â•â• */}
                {showComparison && originalPreviewUrl && resultBlobUrl ? (() => {
                  const w = imageNatW || 800;
                  const h = imageNatH || 600;
                  const maxW = window.innerWidth  * 0.92;
                  const maxH = window.innerHeight * 0.88;
                  const scale = Math.min(1, maxW / w, maxH / h);
                  const dw = Math.round(w * scale);
                  const dh = Math.round(h * scale);

                  return (
                    <div
                      className="relative select-none rounded-xl overflow-hidden shadow-2xl"
                      style={{ width: dw, height: dh, cursor: 'col-resize', flexShrink: 0 }}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        const r = e.currentTarget.getBoundingClientRect();
                        setSliderPct(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
                      }}
                      onPointerMove={(e) => {
                        if (e.buttons !== 1) return;
                        const r = e.currentTarget.getBoundingClientRect();
                        setSliderPct(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
                      }}
                    >
                      {/* â”€â”€ AFTER base layer â€” processed result (right side), checkerboard bg â”€â”€ */}
                      <div style={{ position: 'absolute', inset: 0, ...CHECKER_STYLE }}>
                        <img
                          src={resultBlobUrl}
                          alt="Background removed"
                          draggable={false}
                          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'fill' }}
                        />
                      </div>

                      {/* â”€â”€ BEFORE layer â€” original image clipped to LEFT of slider â”€â”€ */}
                      <div
                        style={{
                          position: 'absolute', inset: 0,
                          clipPath: `inset(0 ${100 - sliderPct}% 0 0)`,
                        }}
                      >
                        <img
                          src={originalPreviewUrl}
                          alt="Original"
                          draggable={false}
                          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'fill', userSelect: 'none' }}
                        />
                      </div>

                      {/* Divider line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
                        style={{ left: `${sliderPct}%` }}
                      />

                      {/* Handle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-2 border-violet-200 flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPct}%` }}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M6 9H1M1 9L3.5 6.5M1 9L3.5 11.5M12 9H17M17 9L14.5 6.5M17 9L14.5 11.5" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {/* Labels */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold rounded-full pointer-events-none tracking-widest">BEFORE</div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-violet-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full pointer-events-none tracking-widest">AFTER</div>
                    </div>
                  );
                })() : null}

                {/* â”€â”€ Editable canvas â€” always mounted, hidden in comparison mode â”€â”€
                    Keeping it mounted means canvasCallbackRef never re-fires,
                    so the drawn image is always preserved.                          */}
                <canvas
                  ref={canvasCallbackRef}
                  style={{
                    display: showComparison ? 'none' : 'block',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease',
                    cursor: brushMode === 'erase' ? 'crosshair' : 'cell',
                    touchAction: 'none',
                    maxWidth: zoom <= 1 ? '90vw' : undefined,
                    maxHeight: zoom <= 1 ? '80vh' : undefined,
                    imageRendering: 'auto',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.20)',
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopDraw}
                  onPointerLeave={stopDraw}
                  onPointerCancel={stopDraw}
                />
              </div>

              {/* Success badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm text-[10px] font-bold text-emerald-600 uppercase tracking-wider rounded-full flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
                <CheckCircle2 size={11} /> Background removed Â· Full resolution
              </div>

              {/* Hint */}
              {!showComparison && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-2 pointer-events-none whitespace-nowrap">
                  {brushMode === 'erase' ? <><Eraser size={10} /> Paint to erase Â· Ctrl+Z undo</> : <><Paintbrush size={10} /> Paint to restore Â· Ctrl+Z undo</>}
                </div>
              )}

              {showComparison && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-2 pointer-events-none whitespace-nowrap">
                  <Columns2 size={10} /> Drag the handle to compare
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default BackgroundRemover;
