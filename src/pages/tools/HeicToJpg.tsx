import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Trash2, Download,
  Loader2, X, FileImage, AlertCircle, RefreshCw,
} from 'lucide-react';
// @ts-expect-error — heic2any ships a plain-JS UMD bundle, no types bundled
import heic2any from 'heic2any';
import JSZip from 'jszip';

/* ───────────────────────────────────────────────── */
/*  Types                                            */
/* ───────────────────────────────────────────────── */
type FileStatus = 'pending' | 'converting' | 'done' | 'error';

interface HeicFile {
  id: string;
  file: File;
  name: string;         // original name
  sizeKB: number;
  status: FileStatus;
  previewUrl?: string;  // quick thumbnail generated on add
  originalUrl?: string; // tiny preview of original
  outputBlob?: Blob;    // converted JPEG blob
  outputUrl?: string;   // object-URL for preview
  outputSizeKB?: number;
  error?: string;
}

/* ───────────────────────────────────────────────── */
/*  Helpers                                          */
/* ───────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);

function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'
  );
}

async function convertOne(file: File, quality: number): Promise<Blob> {
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality,       // 0–1
  });
  // heic2any may return Blob | Blob[]
  return Array.isArray(result) ? result[0] : result;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baseName(filename: string): string {
  return filename.replace(/\.(heic|heif)$/i, '');
}

/* ───────────────────────────────────────────────── */
/*  Component                                        */
/* ───────────────────────────────────────────────── */
const HeicToJpg: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [files, setFiles] = useState<HeicFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState<number>(0.92);
  const [isConverting, setIsConverting] = useState(false);

  /* ─── file ingestion ─── */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(isHeic);
    if (!arr.length) return;

    const newEntries: HeicFile[] = arr.map(f => ({
      id: uid(),
      file: f,
      name: f.name,
      sizeKB: Math.round(f.size / 1024),
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...newEntries]);

    // Generate quick low-quality thumbnails asynchronously
    newEntries.forEach(async (entry) => {
      try {
        const thumb = await heic2any({ blob: entry.file, toType: 'image/jpeg', quality: 0.25 });
        const blob = Array.isArray(thumb) ? thumb[0] : thumb;
        const url = URL.createObjectURL(blob);
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, previewUrl: url } : f));
      } catch {
        // silently ignore — placeholder will remain
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  /* ─── per-file state helper ─── */
  const updateFile = (id: string, patch: Partial<HeicFile>) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  /* ─── remove ─── */
  const remove = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.outputUrl) URL.revokeObjectURL(f.outputUrl);
      return prev.filter(x => x.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => { if (f.outputUrl) URL.revokeObjectURL(f.outputUrl); });
    setFiles([]);
  };

  /* ─── convert all pending ─── */
  const convertAll = async () => {
    const pending = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (!pending.length) return;
    setIsConverting(true);

    for (const entry of pending) {
      updateFile(entry.id, { status: 'converting' });
      try {
        const blob = await convertOne(entry.file, quality);
        const url = URL.createObjectURL(blob);
        updateFile(entry.id, {
          status: 'done',
          outputBlob: blob,
          outputUrl: url,
          outputSizeKB: Math.round(blob.size / 1024),
        });
      } catch (err: unknown) {
        updateFile(entry.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Conversion failed',
        });
      }
    }

    setIsConverting(false);
  };

  /* ─── download single ─── */
  const downloadOne = (entry: HeicFile) => {
    if (!entry.outputBlob) return;
    downloadBlob(entry.outputBlob, `${baseName(entry.name)}.jpg`);
  };

  /* ─── download all ─── */
  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.outputBlob);
    if (!done.length) return;

    if (done.length === 1) {
      downloadOne(done[0]);
      return;
    }

    // Batch download via JSZip
    const zip = new JSZip();
    done.forEach(f => zip.file(`${baseName(f.name)}.jpg`, f.outputBlob!));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'converted-images.zip');
  };

  /* ─── derived ─── */
  const doneCount = files.filter(f => f.status === 'done').length;
  const pendingCount = files.filter(f => f.status === 'pending' || f.status === 'error').length;
  const convertingCount = files.filter(f => f.status === 'converting').length;

  const qualityLabel = quality >= 0.9 ? 'High' : quality >= 0.7 ? 'Medium' : 'Low';
  const qualityLevels = [
    { label: 'High', value: 0.92 },
    { label: 'Medium', value: 0.75 },
    { label: 'Low', value: 0.5 },
  ];

  /* ─── Render ─── */
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50 text-foreground select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".heic,.heif,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

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
          <img src="/icons/HEIC to JPG.svg" alt="HEIC to JPG" className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            HEIC → JPG
          </span>
        </div>

        <div className="flex-1" />

        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 font-semibold">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-red-500 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={10} /> Clear
            </button>
          </div>
        )}

        {doneCount > 0 && (
          <button
            onClick={downloadAll}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download size={13} />
            {doneCount === 1 ? 'Download JPG' : `Download All (${doneCount})`}
          </button>
        )}

        {pendingCount > 0 && (
          <button
            onClick={convertAll}
            disabled={isConverting}
            className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isConverting
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />}
            {isConverting
              ? `Converting… (${convertingCount})`
              : `Convert ${pendingCount === files.length ? 'All' : `${pendingCount}`}`}
          </button>
        )}
      </header>

      {/* ══ BODY ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ─── Left: settings panel ─── */}
        <aside className="w-72 shrink-0 bg-white border-r border-neutral-200 overflow-hidden p-5 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
              Conversion Settings
            </p>

            {/* Output Quality */}
            <div className="space-y-2 mb-5">
              <label className="text-[11px] font-semibold text-neutral-600">
                JPEG Quality
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {qualityLevels.map(q => (
                  <button
                    key={q.label}
                    onClick={() => setQuality(q.value)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      quality === q.value
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400">
                {quality === 0.92 && 'Best visual quality, larger file size'}
                {quality === 0.75 && 'Balanced quality and file size'}
                {quality === 0.5  && 'Smaller files, some quality loss'}
              </p>
            </div>

            {/* Format info */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Output</p>
              <p className="text-[11px] text-neutral-700 font-semibold">JPEG (.jpg)</p>
              <p className="text-[10px] text-neutral-500">Quality: {qualityLabel} ({Math.round(quality * 100)}%)</p>
            </div>
          </div>

          {/* Stats */}
          {files.length > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[11px] space-y-2">
              <p className="font-bold text-neutral-700">Summary</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total files</span>
                  <span className="font-semibold text-neutral-700">{files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Converted</span>
                  <span className="font-semibold text-emerald-600">{doneCount}</span>
                </div>
                {pendingCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pending</span>
                    <span className="font-semibold text-violet-600">{pendingCount}</span>
                  </div>
                )}
                {files.filter(f => f.status === 'error').length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Failed</span>
                    <span className="font-semibold text-red-500">
                      {files.filter(f => f.status === 'error').length}
                    </span>
                  </div>
                )}
              </div>

              {/* Size savings */}
              {doneCount > 0 && (() => {
                const origKB = files.filter(f => f.status === 'done').reduce((s, f) => s + f.sizeKB, 0);
                const outKB  = files.filter(f => f.status === 'done').reduce((s, f) => s + (f.outputSizeKB ?? 0), 0);
                const savings = origKB - outKB;
                return (
                  <div className="pt-1 border-t border-neutral-200">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Size change</span>
                      <span className={`font-semibold ${savings > 0 ? 'text-emerald-600' : 'text-neutral-600'}`}>
                        {savings > 0 ? `-${savings} KB` : `+${Math.abs(savings)} KB`}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 text-center leading-relaxed">
              All processing happens locally in your browser.<br />No files are uploaded to any server.
            </p>
          </div>
        </aside>

        {/* ─── Right: file list + drop zone ─── */}
        <main
          ref={dropRef}
          className="flex-1 overflow-y-auto p-4 relative"
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-4 z-20 rounded-2xl border-2 border-dashed border-violet-400 bg-violet-50/80 flex items-center justify-center pointer-events-none"
              >
                <p className="text-sm font-bold text-violet-600">Drop HEIC files here</p>
              </motion.div>
            )}
          </AnimatePresence>

          {files.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
              <motion.div
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer w-48 h-48 rounded-2xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-violet-400 hover:text-violet-500 transition-colors shadow-sm"
              >
                <Upload size={56} strokeWidth={1.5} />
              </motion.div>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-neutral-800">Drop HEIC files or click to upload</p>
                <p className="text-xs text-neutral-400">Supports .heic and .heif — multiple files at once</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md shadow-violet-100"
              >
                <Upload size={13} /> Choose HEIC Files
              </button>
            </div>
          ) : (
            /* File grid */
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                  Files ({files.length})
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors"
                >
                  <Upload size={10} /> Add More
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <AnimatePresence initial={false}>
                  {files.map(entry => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.18 }}
                      className="relative group rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm aspect-square flex flex-col"
                    >
                      {/* Preview area */}
                      <div className="flex-1 relative overflow-hidden bg-neutral-100 flex items-center justify-center">
                        {(entry.outputUrl || entry.previewUrl) ? (
                          <img
                            src={entry.outputUrl ?? entry.previewUrl}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-neutral-300">
                            <Loader2 size={22} className="animate-spin" />
                            <span className="text-[9px] font-bold uppercase">Loading preview...</span>
                          </div>
                        )}

                        {/* Status overlay */}
                        {entry.status === 'converting' && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Loader2 size={22} className="animate-spin text-violet-500" />
                          </div>
                        )}
                        {entry.status === 'error' && (
                          <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-1 p-2">
                            <AlertCircle size={20} className="text-red-500" />
                            <p className="text-[8px] font-bold text-red-500 text-center leading-tight">
                              {entry.error ?? 'Failed'}
                            </p>
                          </div>
                        )}

                        {/* Status badge */}
                        <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[8px] font-bold rounded-md pointer-events-none ${
                          entry.status === 'done'
                            ? 'bg-emerald-500 text-white'
                            : entry.status === 'converting'
                              ? 'bg-violet-600 text-white'
                              : entry.status === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-neutral-300 text-neutral-700'
                        }`}>
                          {entry.status === 'done' && '✓ JPG'}
                          {entry.status === 'converting' && 'Converting'}
                          {entry.status === 'error' && 'Error'}
                          {entry.status === 'pending' && 'HEIC'}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => remove(entry.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={9} />
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="px-2 py-1.5 border-t border-neutral-100 bg-white">
                        <p className="text-[9px] font-semibold text-neutral-700 truncate" title={entry.name}>
                          {baseName(entry.name)}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[8px] text-neutral-400">
                            {entry.status === 'done' && entry.outputSizeKB
                              ? `${entry.outputSizeKB} KB`
                              : `${entry.sizeKB} KB`}
                          </span>
                          {entry.status === 'done' && (
                            <button
                              onClick={() => downloadOne(entry)}
                              className="flex items-center gap-0.5 text-[8px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Download size={8} /> Save
                            </button>
                          )}
                          {entry.status === 'pending' && (
                            <button
                              onClick={async () => {
                                updateFile(entry.id, { status: 'converting' });
                                try {
                                  const blob = await convertOne(entry.file, quality);
                                  const url = URL.createObjectURL(blob);
                                  updateFile(entry.id, {
                                    status: 'done',
                                    outputBlob: blob,
                                    outputUrl: url,
                                    outputSizeKB: Math.round(blob.size / 1024),
                                  });
                                } catch (err: unknown) {
                                  updateFile(entry.id, { status: 'error', error: err instanceof Error ? err.message : 'Failed' });
                                }
                              }}
                              className="text-[8px] font-bold text-violet-600 hover:text-violet-700 transition-colors"
                            >
                              Convert
                            </button>
                          )}
                          {entry.status === 'error' && (
                            <button
                              onClick={() => updateFile(entry.id, { status: 'pending', error: undefined })}
                              className="text-[8px] font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HeicToJpg;
