import { BrandPalette, getContrastTextColor, getContrastRatio, getWCAGLevel } from '@/lib/colorUtils';
import { Check } from 'lucide-react';

interface PaletteOverviewProps {
  palettes: BrandPalette[];
  activePalette: number;
  onSelectPalette: (index: number) => void;
}

const ScaleStrip = ({ scale, label }: { scale: Record<number, string>; label: string }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
    <div className="flex h-16">
      {Object.entries(scale).map(([step, hex]) => (
        <div key={step} className="flex-1 relative group cursor-pointer" style={{ backgroundColor: hex }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-mono font-bold" style={{ color: getContrastTextColor(hex) }}>{step}</span>
            <span className="text-[8px] font-mono" style={{ color: getContrastTextColor(hex) }}>{hex.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SmallSwatch = ({ hex, label }: { hex: string; label: string }) => {
  const textColor = getContrastTextColor(hex);
  const ratio = getContrastRatio(hex, textColor);
  const level = getWCAGLevel(ratio);
  return (
    <div className="flex-1 h-20 p-2 flex flex-col justify-between" style={{ backgroundColor: hex }}>
      <span className="text-[9px] font-bold uppercase" style={{ color: textColor }}>{label}</span>
      <div className="flex justify-between items-end">
        <span className="text-[8px] font-mono" style={{ color: textColor }}>{hex.toUpperCase()}</span>
        <span className="text-[8px] font-bold px-1 py-0.5" style={{ backgroundColor: textColor, color: hex }}>{level}</span>
      </div>
    </div>
  );
};

const PaletteOverview = ({ palettes, activePalette, onSelectPalette }: PaletteOverviewProps) => {
  const palette = palettes[activePalette];
  if (!palette) return null;

  return (
    <section className="w-full bg-background section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Palette Overview</h2>
        <p className="text-muted-foreground mb-8">6 palette strategies generated from your base color. Select one to apply.</p>

        {/* Palette tabs */}
        <div className="flex gap-1 mb-10">
          {palettes.map((p, i) => (
            <button key={i} onClick={() => onSelectPalette(i)}
              className={`h-10 px-5 text-sm font-bold transition-colors flex items-center gap-2 ${
                i === activePalette ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}>
              {i === activePalette && <Check className="w-3 h-3" />}
              {p.name}
            </button>
          ))}
        </div>

        {/* Primary scale */}
        <ScaleStrip scale={palette.primary} label="Primary P050–P900" />

        {/* Secondary, Accent, Neutrals */}
        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Secondary</p>
            <div className="flex">
              {Object.entries(palette.secondary).map(([k, hex]) => <SmallSwatch key={k} hex={hex} label={`S${k}`} />)}
            </div>
          </div>
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Accent A & B</p>
            <div className="flex">
              <SmallSwatch hex={palette.accentA['400']} label="A400" />
              <SmallSwatch hex={palette.accentA['600']} label="A600" />
              <SmallSwatch hex={palette.accentB['400']} label="B400" />
              <SmallSwatch hex={palette.accentB['600']} label="B600" />
            </div>
          </div>
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Feedback</p>
            <div className="flex">
              <SmallSwatch hex={palette.feedback.success} label="Success" />
              <SmallSwatch hex={palette.feedback.warning} label="Warning" />
              <SmallSwatch hex={palette.feedback.danger} label="Danger" />
              <SmallSwatch hex={palette.feedback.info} label="Info" />
            </div>
          </div>
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Usage Legend</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4" style={{ backgroundColor: palette.primary[50] }} /> <span className="text-foreground font-medium">Background</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4" style={{ backgroundColor: palette.primary[100] }} /> <span className="text-foreground font-medium">Surface</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4" style={{ backgroundColor: palette.primary[900] }} /> <span className="text-foreground font-medium">Text</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4" style={{ backgroundColor: palette.accentA[600] }} /> <span className="text-foreground font-medium">CTA</span></div>
            </div>
          </div>
        </div>

        {/* Neutrals */}
        <div className="mt-8">
          <ScaleStrip scale={palette.neutrals} label="Neutrals N050–N900" />
        </div>
      </div>
    </section>
  );
};

export default PaletteOverview;
