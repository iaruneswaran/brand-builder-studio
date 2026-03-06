import { useState, useCallback } from 'react';
import { generateAllPalettes, randomHex, BrandPalette } from '@/lib/colorUtils';
import Header from '@/components/brand/Header';
import ColorPickerSection from '@/components/brand/ColorPickerSection';
import PaletteOverview from '@/components/brand/PaletteOverview';
import ColorTokens from '@/components/brand/ColorTokens';
import TypographySection from '@/components/brand/TypographySection';
import ComponentsSection from '@/components/brand/ComponentsSection';
import LayoutSection from '@/components/brand/LayoutSection';
import PageTemplatesSection from '@/components/brand/PageTemplatesSection';
import SocialTemplatesSection from '@/components/brand/SocialTemplatesSection';
import DataVizSection from '@/components/brand/DataVizSection';
import ExportSection from '@/components/brand/ExportSection';

const Index = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [palettes, setPalettes] = useState<BrandPalette[]>(() => generateAllPalettes('#3B82F6'));
  const [activePalette, setActivePalette] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const handleGenerate = useCallback(() => {
    setPalettes(generateAllPalettes(baseColor));
    setActivePalette(0);
  }, [baseColor]);

  const handleColorChange = useCallback((hex: string) => {
    setBaseColor(hex);
    setPalettes(generateAllPalettes(hex));
  }, []);

  const handleRandomize = useCallback(() => {
    const hex = randomHex();
    setBaseColor(hex);
    setPalettes(generateAllPalettes(hex));
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode(d => !d);
    document.documentElement.classList.toggle('dark');
  }, []);

  const handleExport = useCallback(() => {
    window.print();
  }, []);

  const currentPalette = palettes[activePalette];

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} onToggleTheme={toggleTheme} onExport={handleExport} onGenerate={handleRandomize} />
      <ColorPickerSection baseColor={baseColor} onColorChange={handleColorChange} onGenerate={handleGenerate} />
      {currentPalette && (
        <>
          <PaletteOverview palettes={palettes} activePalette={activePalette} onSelectPalette={setActivePalette} />
          <ColorTokens palette={currentPalette} />
          <TypographySection palette={currentPalette} />
          <ComponentsSection palette={currentPalette} />
          <LayoutSection palette={currentPalette} />
          <PageTemplatesSection palette={currentPalette} />
          <SocialTemplatesSection palette={currentPalette} />
          <DataVizSection palette={currentPalette} />
          <ExportSection palette={currentPalette} />
        </>
      )}
    </div>
  );
};

export default Index;
