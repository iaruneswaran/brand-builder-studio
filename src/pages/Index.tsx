import { useState, useCallback } from 'react';
import { generateAllPalettes, BrandPalette } from '@/lib/colorUtils';
import ColorPickerSection from '@/components/brand/ColorPickerSection';
import PaletteOverview from '@/components/brand/PaletteOverview';
import { AnimatePresence, motion } from 'framer-motion';

const Index = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [palettes, setPalettes] = useState<BrandPalette[]>(() => generateAllPalettes('#3B82F6'));
  const [activePalette, setActivePalette] = useState(0);

  const handleColorChange = useCallback((hex: string) => {
    setBaseColor(hex);
    setPalettes(generateAllPalettes(hex));
  }, []);


  const currentPalette = palettes[activePalette];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background">
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

export default Index;
