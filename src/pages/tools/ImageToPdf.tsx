import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileDown, Upload, Trash2, ChevronUp, ChevronDown,
  GripVertical, ImageIcon, CheckCircle2, Loader2, X, FileText,
  ZoomIn, ZoomOut, RotateCw,
} from 'lucide-react';

/* ───────────────────────────────────────────────── */
/*  Types                                            */
/* ───────────────────────────────────────────────── */
interface PdfImage {
  id: string;
  file: File;
  url: string;
  name: string;
  sizeKB: number;
  rotation: number; // 0 | 90 | 180 | 270
  width: number;
  height: number;
}

type PageSize = 'A4' | 'Letter' | 'A3' | 'fit';
type Orientation = 'portrait' | 'landscape';
type Quality = 'high' | 'medium' | 'low';

/* ───────────────────────────────────────────────── */
/*  Helpers                                          */
/* ───────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

// Page size in mm → points (1 pt = 0.352778 mm)
const PAGE_SIZES: Record<PageSize, [number, number]> = {
  A4:     [595, 842],
  Letter: [612, 792],
  A3:     [842, 1191],
  fit:    [0, 0], // dynamically set per image
};

// Returns CSS aspect-ratio string for the chosen page settings
function getCardAspect(pageSize: PageSize, orientation: Orientation, img?: HTMLImageElement | null): string {
  if (pageSize === 'fit') {
    if (img && img.naturalWidth && img.naturalHeight) {
      return `${img.naturalWidth} / ${img.naturalHeight}`;
    }
    return '1 / 1';
  }
  const [w, h] = PAGE_SIZES[pageSize];
  const [fw, fh] = orientation === 'portrait' ? [w, h] : [h, w];
  return `${fw} / ${fh}`;
}

async function buildPdf(
  images: PdfImage[],
  pageSize: PageSize,
  orientation: Orientation,
  margin: number,     // px on canvas
  quality: Quality,
): Promise<Blob> {
  // Dynamic import — jspdf is loaded lazily
  const { jsPDF } = await import('jspdf');

  const qMap: Record<Quality, number> = { high: 1.0, medium: 0.85, low: 0.7 };
  const q = qMap[quality];

  let pdf: InstanceType<typeof jsPDF> | null = null;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];

    // Draw image to an off-screen canvas (apply rotation)
    const imgEl = await loadImg(item.url);
    const rotated = item.rotation % 180 !== 0;
    const cw = rotated ? imgEl.naturalHeight : imgEl.naturalWidth;
    const ch = rotated ? imgEl.naturalWidth  : imgEl.naturalHeight;
    const isHigh = quality === 'high';
 
    const offscreen = document.createElement('canvas');
    offscreen.width = cw;
    offscreen.height = ch;
    const ctx = offscreen.getContext('2d', { alpha: true })!;
    
    // Smooth rendering for rotations
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.translate(cw / 2, ch / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.drawImage(imgEl, -imgEl.naturalWidth / 2, -imgEl.naturalHeight / 2);

    // For "best ever" quality, use PNG (lossless) if 'high' is selected.
    // Otherwise use JPEG with the chosen quality factor.
    const format = isHigh ? 'image/png' : 'image/jpeg';
    const dataUrl = offscreen.toDataURL(format, isHigh ? undefined : q);

    // Determine page dimensions in pt
    let [pw, ph] = PAGE_SIZES[pageSize];
    if (pageSize === 'fit') {
      // fit image — use image dimensions + margin (1pt = 1px at 72 DPI)
      pw = cw + margin * 2;
      ph = ch + margin * 2;
    }
    if (orientation === 'landscape' && pageSize !== 'fit') {
      [pw, ph] = [ph, pw];
    }

    if (!pdf) {
      pdf = new jsPDF({ unit: 'pt', format: [pw, ph], orientation: 'p' });
    } else {
      pdf.addPage([pw, ph], 'p');
    }

    // For fixed page sizes, shrink-to-fit within the requested margin.
    // In 'fit' mode, the page is already sized to include the margin if we update the pw/ph logic.
    const effectiveMargin = margin;
    const availW = pw - effectiveMargin * 2;
    const availH = ph - effectiveMargin * 2;
    const scale = Math.min(availW / cw, availH / ch);
    const dw = cw * scale;
    const dh = ch * scale;
    const x = (pw - dw) / 2;
    const y = (ph - dh) / 2;

    pdf.addImage(dataUrl, isHigh ? 'PNG' : 'JPEG', x, y, dw, dh, undefined, isHigh ? 'NONE' : 'FAST');
  }

  return pdf!.output('blob');
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/* ───────────────────────────────────────────────── */
/*  Component                                        */
/* ───────────────────────────────────────────────── */
const ImageToPdf: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<PdfImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [building, setBuilding] = useState(false);
  const [done, setDone] = useState(false);
  const [pdfBlob, setPdfBlob]  = useState<Blob | null>(null);

  // Settings
  const [pageSize, setPageSize]       = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin]           = useState(0); // 0 = Auto, 20 = Medium, 40 = Large
  const [quality, setQuality]         = useState<Quality>('high');
  const [filename, setFilename]       = useState('images');

  /* ─── file handling ─── */
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newImgs: PdfImage[] = await Promise.all(arr.map(async f => {
      const url = URL.createObjectURL(f);
      const img = await loadImg(url);
      return {
        id: uid(),
        file: f,
        url,
        name: f.name,
        sizeKB: Math.round(f.size / 1024),
        rotation: 0,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    }));
    setImages(prev => [...prev, ...newImgs]);
    setDone(false);
    setPdfBlob(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) { 
      addFiles(e.target.files).catch(console.error); 
      e.target.value = ''; 
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files).catch(console.error);
    }
  }, [addFiles]);

  /* ─── list operations ─── */
  const remove = (id: string) =>
    setImages(prev => { const i = prev.find(x => x.id === id); if (i) URL.revokeObjectURL(i.url); return prev.filter(x => x.id !== id); });

  const move = (id: string, dir: -1 | 1) =>
    setImages(prev => {
      const idx = prev.findIndex(x => x.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });

  const rotate = (id: string) =>
    setImages(prev => prev.map(x => x.id === id ? { ...x, rotation: (x.rotation + 90) % 360 } : x));

  const clearAll = () => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    setDone(false);
    setPdfBlob(null);
  };

  /* ─── build PDF ─── */
  const handleBuild = async () => {
    if (!images.length) return;
    setBuilding(true);
    try {
      const blob = await buildPdf(images, pageSize, orientation, margin, quality);
      setPdfBlob(blob);
      setDone(true);
      // Auto-download once ready
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || 'images'}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error(e);
    } finally {
      setBuilding(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'images'}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ─── Render ─── */
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50 text-foreground select-none">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

      {/* ══ TOP BAR ══ */}
      <header className="shrink-0 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shadow-sm z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors px-1.5 py-1 rounded-md hover:bg-neutral-100"
        >
          <ArrowLeft size={14} /> <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-4 w-px bg-neutral-200" />

        <div className="flex items-center gap-2">
          <FileDown size={14} className="text-violet-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">Image to PDF</span>
        </div>

        <div className="flex-1" />

        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 font-semibold">{images.length} image{images.length !== 1 ? 's' : ''}</span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-500 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={10} /> Clear
            </button>
          </div>
        )}

        {done ? (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FileDown size={13} /> Download PDF
          </button>
        ) : (
          <button
            onClick={handleBuild}
            disabled={images.length === 0 || building}
            className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {building ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
            {building ? 'Building…' : 'Create PDF'}
          </button>
        )}
      </header>

      {/* ══ BODY ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ─── Left: settings panel ─── */}
        <aside className="w-80 shrink-0 bg-white border-r border-neutral-200 overflow-hidden p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">PDF Settings</p>

            {/* Page Size */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold text-neutral-600">Page Size</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['A4', 'Letter', 'A3', 'fit'] as PageSize[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      pageSize === s
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {s === 'fit' ? 'Fit Image' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            {pageSize !== 'fit' && (
              <div className="space-y-1 mb-4">
                <label className="text-[11px] font-semibold text-neutral-600">Orientation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['portrait', 'landscape'] as Orientation[]).map(o => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border capitalize transition-all ${
                        orientation === o
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quality */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold text-neutral-600">Image Quality</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['high', 'medium', 'low'] as Quality[]).map(q => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border capitalize transition-all ${
                      quality === q
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold text-neutral-600">Margins</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Auto', value: 0 },
                  { label: 'Medium', value: 20 },
                  { label: 'Large', value: 40 }
                ].map(m => (
                  <button
                    key={m.label}
                    onClick={() => setMargin(m.value)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      margin === m.value
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filename */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-600">Filename</label>
              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-[11px] font-semibold bg-transparent focus:outline-none text-neutral-800"
                  placeholder="my-document"
                />
                <span className="text-[10px] text-neutral-400 pr-2.5 font-semibold">.pdf</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          {images.length > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[11px] space-y-1">
              <p className="font-bold text-neutral-700">Summary</p>
              <p className="text-neutral-500">{images.length} page{images.length !== 1 ? 's' : ''}</p>
              <p className="text-neutral-500">{pageSize === 'fit' ? 'Fit to image' : `${pageSize} · ${orientation}`}</p>
              <p className="text-neutral-500">Quality: {quality}</p>
              <p className="text-neutral-500">Margin: {margin === 0 ? 'Auto' : margin === 20 ? 'Medium' : 'Large'} ({margin} pt)</p>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 text-center leading-relaxed">
              All processing happens locally in your browser. No files are uploaded.
            </p>
          </div>
        </aside>

        {/* ─── Right: image list + drop zone ─── */}
        <main
          ref={dropRef}
          className="flex-1 overflow-y-auto p-4 relative"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-4 z-20 rounded-2xl border-2 border-dashed border-violet-400 bg-violet-50/80 flex items-center justify-center pointer-events-none"
              >
                <p className="text-sm font-bold text-violet-600">Drop images here</p>
              </motion.div>
            )}
          </AnimatePresence>

          {images.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center gap-5 text-center">
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.04 }}
                className="cursor-pointer w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-colors shadow-sm"
              >
                <Upload size={40} />
              </motion.div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-neutral-800">Drop images or click to upload</p>
                <p className="text-xs text-neutral-400">JPG · PNG · WebP · GIF — multiple files supported</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
              >
                <Upload size={13} /> Choose Images
              </button>
            </div>
          ) : (
            /* ── Square grid cards ── */
            <div className="max-w-4xl mx-auto">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">Pages ({images.length})</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <Upload size={10} /> Add More
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                <AnimatePresence initial={false}>
                  {images.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18 }}
                      className="relative group overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm cursor-default rounded-xl"
                      style={{ 
                        aspectRatio: pageSize === 'fit' ? 'auto' : getCardAspect(pageSize, orientation)
                      }}
                    >
                      {/* Full-bleed image wrapper with padding for margin */}
                      <div 
                        className="w-full h-full flex items-center justify-center bg-white"
                        style={{ 
                          padding: pageSize === 'fit' 
                            ? `${(100 * margin / ((img.rotation % 180 === 0 ? img.width : img.height) + 2 * margin))}%`
                            : `${(100 * margin / (orientation === 'portrait' ? PAGE_SIZES[pageSize][0] : PAGE_SIZES[pageSize][1]))}%` 
                        }}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          draggable={false}
                          className={`w-full h-full ${pageSize === 'fit' ? 'object-contain' : 'object-cover'}`}
                          style={{ 
                            transform: `rotate(${img.rotation}deg)`, 
                            transition: 'transform 0.25s ease',
                          }}
                        />
                      </div>

                      {/* Page number badge */}
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded-md pointer-events-none">
                        {idx + 1}
                      </div>

                      {/* Page size badge — reflects current settings */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-violet-600/80 backdrop-blur-sm text-white text-[8px] font-bold rounded-md pointer-events-none tracking-wide">
                        {pageSize === 'fit' ? 'Fit' : `${pageSize} ${orientation === 'portrait' ? '↕' : '↔'}`}
                      </div>

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        {/* Row 1: rotate + delete */}
                        <div className="flex gap-1">
                          <button onClick={() => rotate(img.id)} title="Rotate 90°"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors">
                            <RotateCw size={12} />
                          </button>
                          <button onClick={() => remove(img.id)} title="Remove"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/70 text-white transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                        {/* Row 2: move up + move down */}
                        <div className="flex gap-1">
                          <button onClick={() => move(img.id, -1)} disabled={idx === 0} title="Move left"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-colors">
                            <ChevronUp size={12} />
                          </button>
                          <button onClick={() => move(img.id, 1)} disabled={idx === images.length - 1} title="Move right"
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white disabled:opacity-30 transition-colors">
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Download message removed per user request */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ImageToPdf;
