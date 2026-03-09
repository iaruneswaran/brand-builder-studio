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
    <section className="w-full bg-card section-padding mt-12 pt-12">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">Color Tokens</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Design tokens ready for CSS custom properties, Tailwind config, or any design tool. Precision values for consistent implementation.</p>

        <div className="bg-white shadow-hard overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 bg-neutral-100 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            <div className="col-span-1">Swatch</div>
            <div className="col-span-3">Token Variable</div>
            <div className="col-span-2">HEX Code</div>
            <div className="col-span-3">HSL Parameters</div>
            <div className="col-span-1 text-center">Ratio</div>
            <div className="col-span-1 text-center">WCAG</div>
            <div className="col-span-1 text-right">Copy</div>
          </div>
          {scaleEntries.map(({ step, hex, token, cssVal, textColor, ratio, level }) => (
            <div key={step} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-neutral-50 transition-colors group">
              <div className="col-span-1">
                <div className="w-10 h-10 shadow-hard-sm" style={{ backgroundColor: hex }} />
              </div>
              <div className="col-span-3 font-mono text-[13px] font-bold text-foreground">{token}</div>
              <div className="col-span-2 font-mono text-[13px] text-neutral-600">{hex.toUpperCase()}</div>
              <div className="col-span-3 font-mono text-[13px] text-neutral-500">{cssVal}</div>
              <div className="col-span-1 font-mono text-[13px] text-center font-bold text-foreground">{ratio}:1</div>
              <div className="col-span-1 flex justify-center">
                <span className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest ${level === 'AAA' ? 'bg-primary text-white' :
                  level === 'AA' ? 'bg-primary/20 text-primary' :
                    'bg-danger/10 text-danger'
                  }`} style={{ backgroundColor: level === 'AAA' ? palette.primary[500] : undefined }}>
                  {level}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => copyToken(`${token}: ${cssVal};`)}
                  className="inline-flex items-center justify-center w-8 h-8 text-neutral-400 hover:text-primary transition-all group-hover:bg-neutral-100"
                >
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
