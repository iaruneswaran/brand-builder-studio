import { useState, useCallback } from 'react';
import { generateAllPalettes, BrandPalette, randomHex } from '@/lib/colorUtils';
import ColorPickerSection from '@/components/brand/ColorPickerSection';
import PaletteOverview from '@/components/brand/PaletteOverview';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette } from 'lucide-react';

const BrandPalette = () => {
  const navigate = useNavigate();
  const [baseColor, setBaseColor] = useState(() => randomHex());
  const [palettes, setPalettes] = useState<BrandPalette[]>(() => generateAllPalettes(baseColor));
  const [activePalette, setActivePalette] = useState(0);

  const handleColorChange = useCallback((hex: string) => {
    setBaseColor(hex);
    setPalettes(generateAllPalettes(hex));
  }, []);

  const currentPalette = palettes[activePalette];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background select-none">
      <header className="shrink-0 border-b flex items-center h-12 px-3 gap-2 z-20 relative" style={{ backgroundColor: 'hsl(262 20% 98.5%)', borderColor: 'hsl(262 8% 91%)' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-xs font-semibold transition-colors px-1.5 py-1 rounded-md"
          style={{ color: 'hsl(250 10% 40%)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(262 84% 50%)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(262 84% 97%)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'hsl(250 10% 40%)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="h-4 w-px" style={{ backgroundColor: 'hsl(262 8% 88%)' }} />

        <div className="flex items-center gap-2">
          <img src="/Icons/Brand Palette.svg" alt="Brand Palette" className="w-4 h-4" />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'hsl(240 15% 12%)' }}>Brand Palette</span>
        </div>
      </header>

      <ColorPickerSection baseColor={baseColor} onColorChange={handleColorChange} />
      <AnimatePresence mode="wait">
        {currentPalette && (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 min-h-0"
          >
            <PaletteOverview palettes={palettes} activePalette={activePalette} onSelectPalette={setActivePalette} />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandPalette;
