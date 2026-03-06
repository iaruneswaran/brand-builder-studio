import { useState } from 'react';
import { hexToHSL, hslToHex, randomHex } from '@/lib/colorUtils';
import { Shuffle, Pipette, Settings } from 'lucide-react';

interface ColorPickerSectionProps {
  baseColor: string;
  onColorChange: (hex: string) => void;
  onGenerate: () => void;
}

const ColorPickerSection = ({ baseColor, onColorChange, onGenerate }: ColorPickerSectionProps) => {
  const hsl = hexToHSL(baseColor);
  const [localHex, setLocalHex] = useState(baseColor);

  const handleHexInput = (val: string) => {
    setLocalHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onColorChange(val);
  };

  const handleSlider = (prop: 'h' | 's' | 'l', value: number) => {
    const newHSL = { ...hsl, [prop]: value };
    const hex = hslToHex(newHSL.h, newHSL.s, newHSL.l);
    setLocalHex(hex);
    onColorChange(hex);
  };

  const handleRandomize = () => {
    const hex = randomHex();
    setLocalHex(hex);
    onColorChange(hex);
  };

  return (
    <section className="w-full bg-card border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12 py-10">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Brand Guide Generator</h1>
          <p className="text-lg text-muted-foreground">Enter a base color to generate a complete brand system with tokens, typography, and components.</p>
        </div>

        <div className="grid grid-cols-12 gap-8 items-end">
          {/* Color preview + HEX input */}
          <div className="col-span-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Base Color</label>
            <div className="flex items-stretch">
              <div className="w-16 h-14 border border-border flex-shrink-0" style={{ backgroundColor: baseColor }} />
              <input
                type="text"
                value={localHex}
                onChange={e => handleHexInput(e.target.value)}
                className="flex-1 h-14 px-4 bg-background border border-l-0 border-border text-foreground text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* HSL sliders */}
          <div className="col-span-5 space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-8">H</label>
              <input type="range" min={0} max={360} value={hsl.h} onChange={e => handleSlider('h', +e.target.value)}
                className="flex-1 h-2 appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground" />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">{hsl.h}°</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-8">S</label>
              <input type="range" min={0} max={100} value={hsl.s} onChange={e => handleSlider('s', +e.target.value)}
                className="flex-1 h-2 appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground" />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">{hsl.s}%</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground w-8">L</label>
              <input type="range" min={0} max={100} value={hsl.l} onChange={e => handleSlider('l', +e.target.value)}
                className="flex-1 h-2 appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground" />
              <span className="text-sm font-mono text-muted-foreground w-10 text-right">{hsl.l}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-4 flex items-end gap-3 justify-end">
            <button onClick={handleRandomize} className="h-14 px-5 bg-secondary text-secondary-foreground font-bold text-sm hover:bg-muted transition-colors flex items-center gap-2">
              <Shuffle className="w-4 h-4" /> Randomize
            </button>
            <button className="h-14 px-5 bg-secondary text-secondary-foreground font-bold text-sm hover:bg-muted transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" /> Advanced
            </button>
            <button onClick={onGenerate} className="h-14 px-8 bg-primary text-primary-foreground font-extrabold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <Pipette className="w-4 h-4" /> Generate Palette
            </button>
          </div>
        </div>

        {/* Palette preview strip */}
        <div className="mt-6 flex h-12">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((step) => {
            const l = step === 50 ? 97 : step === 900 ? 15 : 100 - (step / 10);
            const hex = hslToHex(hsl.h, hsl.s, l);
            return <div key={step} className="flex-1 relative group" style={{ backgroundColor: hex }}>
              <span className="absolute bottom-1 left-1 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: l > 55 ? '#111' : '#fafafa' }}>{step}</span>
            </div>;
          })}
        </div>
      </div>
    </section>
  );
};

export default ColorPickerSection;
