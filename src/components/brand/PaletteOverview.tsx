import { useState, useEffect, useRef } from 'react';
import { BrandPalette, getContrastTextColor, getContrastRatio, getWCAGLevel } from '@/lib/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface PaletteOverviewProps {
  palettes: BrandPalette[];
  activePalette: number;
  onSelectPalette: (index: number) => void;
}

const SwatchItem = ({ step, hex, i, isInitial }: { step: string, hex: string, i: number, isInitial?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const textColor = getContrastTextColor(hex);
  const ratio = getContrastRatio(hex, textColor);
  const level = getWCAGLevel(ratio);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shuffleDelay = isInitial ? i * 0.055 : 0;

  return (
    <motion.div
      key={step}
      initial={isInitial ? { opacity: 0, y: 40, scaleY: 0.6, scaleX: 0.92, rotateZ: (i % 2 === 0 ? -3 : 3) } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1, scale: 1, rotateZ: 0 }}
      transition={isInitial
        ? { delay: shuffleDelay, type: 'spring', stiffness: 260, damping: 22 }
        : { delay: i * 0.02 }
      }
      onClick={handleCopy}
      className="flex-1 p-2 flex flex-col justify-between cursor-pointer group relative"
      style={{ backgroundColor: hex }}
    >
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-medium uppercase" style={{ color: textColor }}>{step}</span>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[8px] font-bold uppercase bg-white/20 px-1 py-0.5 rounded-sm"
              style={{ color: textColor }}
            >
              Copied
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-mono" style={{ color: textColor }}>{hex.toUpperCase()}</span>
        <span className="text-[8px] font-medium px-1 py-0.5" style={{ backgroundColor: textColor, color: hex }}>{level}</span>
      </div>
    </motion.div>
  );
};

const ScaleStrip = ({ scale, label, isInitial }: { scale: Record<string, string>; label: string; isInitial?: boolean }) => (
  <div className="h-full flex flex-col">
    {label && <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground shrink-0">{label}</p>}
    <div className="flex-1 flex min-h-0">
      {Object.entries(scale).map(([step, hex], i) => (
        <SwatchItem key={step} step={step} hex={hex} i={i} isInitial={isInitial} />
      ))}
    </div>
  </div>
);

const SmallSwatch = ({ hex, label, i, isInitial, baseDelay }: { hex: string; label: string; i: number; isInitial?: boolean; baseDelay?: number }) => {
  const [copied, setCopied] = useState(false);
  const textColor = getContrastTextColor(hex);
  const ratio = getContrastRatio(hex, textColor);
  const level = getWCAGLevel(ratio);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shuffleDelay = isInitial ? (baseDelay ?? 0) + i * 0.055 : 0;

  return (
    <motion.div
      layout
      initial={isInitial ? { opacity: 0, y: 50, scaleY: 0.5, scaleX: 0.88, rotateZ: (i % 2 === 0 ? 4 : -4) } : {}}
      animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1, rotateZ: 0 }}
      transition={isInitial
        ? { delay: shuffleDelay, type: 'spring', stiffness: 240, damping: 20 }
        : { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
      }
      onClick={handleCopy}
      className="flex-1 h-full p-2 flex flex-col justify-between cursor-pointer group relative"
      style={{ backgroundColor: hex }}
    >
      <div className="flex justify-between items-start">
        <span className="text-[9px] font-medium uppercase" style={{ color: textColor }}>{label}</span>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[8px] font-bold uppercase bg-white/20 px-1 py-0.5 rounded-sm"
              style={{ color: textColor }}
            >
              Copied
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-mono" style={{ color: textColor }}>{hex.toUpperCase()}</span>
        <span className="text-[8px] font-medium px-1 py-0.5" style={{ backgroundColor: textColor, color: hex }}>{level}</span>
      </div>
    </motion.div>
  );
};

const PaletteOverview = ({ palettes, activePalette, onSelectPalette }: PaletteOverviewProps) => {
  const palette = palettes[activePalette];
  const hasAnimated = useRef(false);
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      // After the longest card finishes animating, mark initial done
      const timer = setTimeout(() => setIsInitial(false), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!palette) return null;

  const primaryCount = Object.keys(palette.primary).length;
  // Secondary row starts after primary animation finishes
  const secondaryBaseDelay = primaryCount * 0.055 + 0.1;
  const secondaryEntries = Object.entries(palette.secondary);
  const accentBaseDelay = secondaryBaseDelay + secondaryEntries.length * 0.055 + 0.05;

  return (
    <section className="w-full h-full bg-background flex flex-col min-h-0">
      <div className="w-full flex-1 flex flex-col min-h-0">
        {/* Palette tabs */}
        <div className="flex w-full shrink-0">
          {palettes.map((p, i) => (
            <motion.button
              key={i}
              onClick={() => onSelectPalette(i)}
              whileHover={{ backgroundColor: i === activePalette ? undefined : "rgba(0,0,0,0.02)" }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 h-12 text-[10px] font-bold uppercase tracking-widest transition-all relative ${i === activePalette
                ? ''
                : 'bg-white text-muted-foreground'
                }`}
            >
              <span className="relative z-10" style={{ color: i === activePalette ? '#ffffff' : undefined }}>
                {p.name}
              </span>
              {i === activePalette && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 shadow-hard-sm"
                  style={{ backgroundColor: '#000000' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePalette}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Primary scale */}
            <div className="flex-[1.5] min-h-0">
              <ScaleStrip scale={palette.primary} label="" isInitial={isInitial} />
            </div>

            {/* Secondary and Accent Scales */}
            <div className="grid grid-cols-12 w-full flex-1 min-h-0 overflow-hidden">
              <div className="col-span-12 lg:col-span-6 h-full">
                <div className="flex h-full">
                  {secondaryEntries.map(([k, hex], i) => (
                    <SmallSwatch key={k} hex={hex} label={`S${k}`} i={i} isInitial={isInitial} baseDelay={secondaryBaseDelay} />
                  ))}
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 h-full">
                <div className="flex h-full">
                  <SmallSwatch hex={palette.accentA['400']} label="A400" i={0} isInitial={isInitial} baseDelay={accentBaseDelay} />
                  <SmallSwatch hex={palette.accentA['600']} label="A600" i={1} isInitial={isInitial} baseDelay={accentBaseDelay} />
                  <SmallSwatch hex={palette.accentB['400']} label="B400" i={2} isInitial={isInitial} baseDelay={accentBaseDelay} />
                  <SmallSwatch hex={palette.accentB['600']} label="B600" i={3} isInitial={isInitial} baseDelay={accentBaseDelay} />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PaletteOverview;
