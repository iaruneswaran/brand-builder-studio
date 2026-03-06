import { BrandPalette, hexToHSL, getContrastTextColor, getContrastRatio, getWCAGLevel } from '@/lib/colorUtils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ColorTokensProps { palette: BrandPalette }

const ColorTokens = ({ palette }: ColorTokensProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToken = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };

  const scaleEntries = Object.entries(palette.primary).map(([step, hex]) => {
    const hsl = hexToHSL(hex);
    const token = `--color-primary-${step}`;
    const cssVal = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    const textColor = getContrastTextColor(hex);
    const ratio = getContrastRatio(hex, textColor);
    return { step, hex, token, cssVal, textColor, ratio, level: getWCAGLevel(ratio) };
  });

  return (
    <section className="w-full bg-card section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Color Tokens</h2>
        <p className="text-muted-foreground mb-8">Design tokens ready for CSS custom properties, Tailwind config, or any design tool.</p>

        <div className="border border-border">
          {/* Table header */}
          <div className="grid grid-cols-12 bg-muted px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
            <div className="col-span-1">Swatch</div>
            <div className="col-span-3">Token</div>
            <div className="col-span-2">HEX</div>
            <div className="col-span-3">HSL Value</div>
            <div className="col-span-1">Contrast</div>
            <div className="col-span-1">WCAG</div>
            <div className="col-span-1">Copy</div>
          </div>
          {scaleEntries.map(({ step, hex, token, cssVal, textColor, ratio, level }) => (
            <div key={step} className="grid grid-cols-12 items-center px-4 py-2 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
              <div className="col-span-1"><div className="w-8 h-8 border border-border" style={{ backgroundColor: hex }} /></div>
              <div className="col-span-3 font-mono text-sm text-foreground">{token}</div>
              <div className="col-span-2 font-mono text-sm text-foreground">{hex.toUpperCase()}</div>
              <div className="col-span-3 font-mono text-sm text-muted-foreground">{cssVal}</div>
              <div className="col-span-1 font-mono text-sm text-foreground">{ratio}:1</div>
              <div className="col-span-1">
                <span className={`text-xs font-bold px-2 py-0.5 ${
                  level === 'AAA' ? 'bg-primary text-primary-foreground' :
                  level === 'AA' ? 'bg-secondary text-secondary-foreground' :
                  'bg-destructive text-destructive-foreground'
                }`}>{level}</span>
              </div>
              <div className="col-span-1">
                <button onClick={() => copyToken(`${token}: ${cssVal};`)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  {copied === `${token}: ${cssVal};` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ColorTokens;
