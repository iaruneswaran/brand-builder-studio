import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, QrCode, Download, Copy, Check, ChevronDown } from 'lucide-react';
import QRCode from 'qrcode';

/* ─────────────────────────────────────────────── */

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

const PRESETS = [
  { label: 'URL', placeholder: 'https://example.com' },
  { label: 'Email', placeholder: 'mailto:hello@example.com' },
  { label: 'Phone', placeholder: 'tel:+1234567890' },
  { label: 'Text', placeholder: 'Enter any text…' },
];

const SIZES = [128, 256, 512, 1024];

/* ─────────────────────────────────────────────── */

const QrGenerator: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('https://');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(512);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [margin, setMargin] = useState(2);
  const [preset, setPreset] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'svg' | 'eps'>('png');
  const [formatOpen, setFormatOpen] = useState(false);

  const generate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;
    try {
      await QRCode.toCanvas(canvas, text, {
        width: 280,
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });
      setHasContent(true);
    } catch {
      setHasContent(false);
    }
  }, [text, fgColor, bgColor, errorLevel, margin]);

  useEffect(() => { generate(); }, [generate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFormatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDownload = async (fmt?: 'png' | 'jpg' | 'svg' | 'eps') => {
    const format = fmt ?? exportFormat;
    try {
      if (format === 'svg') {
        const svgStr = await QRCode.toString(text, {
          type: 'svg',
          margin,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: errorLevel,
          width: size,
        });
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `qr-code.svg`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

      } else if (format === 'eps') {
        const qrData = (QRCode as { create: (...args: unknown[]) => { modules: { size: number, get: (r: number, c: number) => boolean } } }).create(text, { errorCorrectionLevel: errorLevel });
        const modules = qrData.modules;
        const n = modules.size;
        const cellPt = 4;
        const marginPt = margin * cellPt;
        const totalPt = n * cellPt + marginPt * 2;
        const lines: string[] = [
          '%!PS-Adobe-3.0 EPSF-3.0',
          `%%BoundingBox: 0 0 ${totalPt} ${totalPt}`,
          '%%EndComments',
          `${bgColor.slice(1).match(/.{2}/g)!.map(h => (parseInt(h,16)/255).toFixed(3)).join(' ')} setrgbcolor`,
          `0 0 ${totalPt} ${totalPt} rectfill`,
          `${fgColor.slice(1).match(/.{2}/g)!.map(h => (parseInt(h,16)/255).toFixed(3)).join(' ')} setrgbcolor`,
        ];
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (modules.get(r, c)) {
              const x = marginPt + c * cellPt;
              const y = marginPt + (n - 1 - r) * cellPt;
              lines.push(`${x} ${y} ${cellPt} ${cellPt} rectfill`);
            }
          }
        }
        lines.push('%%EOF');
        const blob = new Blob([lines.join('\n')], { type: 'application/postscript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `qr-code.eps`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

      } else {
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = await QRCode.toDataURL(text, {
          width: size,
          margin,
          color: { dark: fgColor, light: bgColor },
          errorCorrectionLevel: errorLevel,
          type: mimeType,
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `qr-code-${size}px.${format}`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreset = (idx: number) => {
    setPreset(idx);
    setText(PRESETS[idx].placeholder);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-50 text-foreground select-none">

      {/* ══ TOP BAR ══ */}
      <header className="shrink-0 bg-white border-b border-neutral-200 flex items-center h-12 px-3 gap-2 shadow-sm z-20 relative">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors px-1.5 py-1 rounded-md hover:bg-neutral-100"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-4 w-px bg-neutral-200" />

        <div className="flex items-center gap-2">
          <img src="/Icons/QR Generator.svg" alt="QR Generator" className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">QR Generator</span>
        </div>

        <div className="flex-1" />

        {hasContent && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Format selector + Download */}
            <div className="flex rounded-lg overflow-hidden border border-violet-600 shadow-sm">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <Download size={11} /> Download {exportFormat.toUpperCase()}
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setFormatOpen(o => !o)}
                  className="flex items-center px-2 py-1.5 bg-violet-700 text-white hover:bg-violet-800 transition-colors border-l border-violet-500"
                >
                  <ChevronDown size={11} />
                </button>
                {formatOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl z-[100] w-28 overflow-hidden">
                    {(['png','jpg','svg','eps'] as const).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => { setExportFormat(fmt); setFormatOpen(false); }}
                        className={`w-full px-3 py-2 text-[11px] font-bold text-left transition-colors ${
                          exportFormat === fmt ? 'bg-violet-50 text-violet-700' : 'text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══ BODY ══ */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ─── Left: Settings ─── */}
        <aside className="w-72 shrink-0 bg-white border-r border-neutral-200 overflow-y-auto p-5 flex flex-col gap-5">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">QR Settings</p>



            {/* Content input */}
            <div className="space-y-1.5 mb-5">
              <label className="text-[11px] font-semibold text-neutral-600">Content</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={PRESETS[preset].placeholder}
                rows={3}
                className="w-full px-3 py-2 text-[11px] font-semibold bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-violet-400 resize-none text-neutral-800 placeholder:text-neutral-400"
              />
            </div>

            {/* Error correction */}
            <div className="space-y-2 mb-5">
              <label className="text-[11px] font-semibold text-neutral-600">Error Correction</label>
              <div className="grid grid-cols-4 gap-1">
                {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setErrorLevel(lvl)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      errorLevel === lvl
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-400">
                {errorLevel === 'L' && 'Low — 7% recovery'}
                {errorLevel === 'M' && 'Medium — 15% recovery'}
                {errorLevel === 'Q' && 'Quartile — 25% recovery'}
                {errorLevel === 'H' && 'High — 30% recovery'}
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-3 mb-5">
              <label className="text-[11px] font-semibold text-neutral-600">Colors</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={e => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer overflow-hidden"
                    style={{ padding: 0, border: 'none' }}
                    title="Foreground color"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-neutral-600">Foreground</p>
                    <p className="text-[10px] text-neutral-400 font-mono">{fgColor.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer overflow-hidden"
                    style={{ padding: 0, border: 'none' }}
                    title="Background color"
                  />
                  <div>
                    <p className="text-[10px] font-bold text-neutral-600">Background</p>
                    <p className="text-[10px] text-neutral-400 font-mono">{bgColor.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-2 mb-5">
              <label className="text-[11px] font-semibold text-neutral-600">Quiet Zone (Margin)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 4].map(m => (
                  <button
                    key={m}
                    onClick={() => setMargin(m)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                      margin === m
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-violet-300'
                    }`}
                  >
                    {m === 1 ? 'Tight' : m === 2 ? 'Normal' : 'Wide'}
                  </button>
                ))}
              </div>
            </div>


          </div>

          {/* Summary */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[11px] space-y-1">
            <p className="font-bold text-neutral-700">Summary</p>
            <p className="text-neutral-500">Type: {PRESETS[preset].label}</p>
            <p className="text-neutral-500">Error correction: {errorLevel}</p>
            <p className="text-neutral-500">Export: {size} × {size}px</p>
            <p className="text-neutral-500">Margin: {margin === 1 ? 'Tight' : margin === 2 ? 'Normal' : 'Wide'}</p>
          </div>

          <div className="mt-auto pt-4 border-t border-neutral-100">
            <p className="text-[9px] text-neutral-400 text-center leading-relaxed">
              All processing happens locally in your browser. No data is uploaded.
            </p>
          </div>
        </aside>

        {/* ─── Right: Preview ─── */}
        <main className="flex-1 overflow-hidden flex flex-col items-center justify-center bg-neutral-50 gap-6 p-8">
          <AnimatePresence mode="wait">
            {text.trim() ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-6"
              >
                {/* QR Canvas */}
                <div className="rounded-2xl border border-neutral-200 p-6 bg-white">
                  <canvas ref={canvasRef} className="rounded-lg" />
                </div>

                {/* Download actions */}
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Download As</p>
                  <div className="grid grid-cols-4 gap-2 w-full">
                    {(['png', 'jpg', 'svg', 'eps'] as const).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => handleDownload(fmt)}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-neutral-200 bg-white hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 transition-all text-neutral-600 shadow-sm"
                      >
                        <Download size={13} />
                        <span className="text-[10px] font-bold uppercase">{fmt}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors w-full justify-center"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>

                <p className="text-[10px] text-neutral-400 font-semibold">
                  {text.length} character{text.length !== 1 ? 's' : ''} · {size} × {size}px export
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-48 h-48 rounded-2xl bg-white border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-300 shadow-sm"
                >
                  <QrCode size={56} strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-neutral-800">Enter content to generate</p>
                  <p className="text-xs text-neutral-400">Type a URL, email, phone number or any text</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default QrGenerator;
