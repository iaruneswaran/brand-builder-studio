import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';

interface TypographySectionProps { palette: BrandPalette }

const TypographySection = ({ palette }: TypographySectionProps) => {
  const lightBg = palette.primary[50];
  const darkBg = palette.neutrals[900];
  const lightText = getContrastTextColor(lightBg);
  const darkText = getContrastTextColor(darkBg);

  const typeScale = [
    { name: 'Display', size: '72px', weight: 800, lineHeight: '1.0', sample: 'Brand Guide' },
    { name: 'H1', size: '48px', weight: 800, lineHeight: '1.1', sample: 'Heading One' },
    { name: 'H2', size: '36px', weight: 700, lineHeight: '1.2', sample: 'Heading Two' },
    { name: 'H3', size: '28px', weight: 700, lineHeight: '1.3', sample: 'Heading Three' },
    { name: 'H4', size: '22px', weight: 600, lineHeight: '1.4', sample: 'Heading Four' },
    { name: 'H5', size: '18px', weight: 600, lineHeight: '1.4', sample: 'Heading Five' },
    { name: 'H6', size: '16px', weight: 600, lineHeight: '1.5', sample: 'Heading Six' },
    { name: 'Body', size: '16px', weight: 400, lineHeight: '1.6', sample: 'The quick brown fox jumps over the lazy dog. This is body text used for paragraphs and content blocks.' },
    { name: 'Caption', size: '12px', weight: 500, lineHeight: '1.5', sample: 'CAPTION TEXT — METADATA' },
  ];

  return (
    <section className="w-full bg-background section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Typography</h2>
        <p className="text-muted-foreground mb-8">Type scale with Plus Jakarta Sans. Pair with a monospace for code and data.</p>

        <div className="grid grid-cols-12 gap-8">
          {/* Type scale */}
          <div className="col-span-7 space-y-1">
            {typeScale.map(t => (
              <div key={t.name} className="flex items-baseline gap-6 py-3 border-b border-border">
                <div className="w-20 flex-shrink-0">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.name}</span>
                  <p className="text-[10px] font-mono text-muted-foreground">{t.size} / {t.lineHeight}</p>
                </div>
                <p className="text-foreground" style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.lineHeight }}>{t.sample}</p>
              </div>
            ))}
          </div>

          {/* Sample on surfaces */}
          <div className="col-span-5 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">On Light Surface</p>
              <div className="p-8 border border-border" style={{ backgroundColor: lightBg }}>
                <h3 className="text-2xl font-bold mb-3" style={{ color: lightText }}>Sample Heading</h3>
                <p className="text-sm leading-relaxed" style={{ color: lightText, opacity: 0.85 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">On Dark Surface</p>
              <div className="p-8 border border-border" style={{ backgroundColor: darkBg }}>
                <h3 className="text-2xl font-bold mb-3" style={{ color: darkText }}>Sample Heading</h3>
                <p className="text-sm leading-relaxed" style={{ color: darkText, opacity: 0.85 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Font Pairing</p>
              <div className="border border-border p-6 bg-card">
                <p className="text-lg font-bold text-foreground mb-1">Primary: Plus Jakarta Sans</p>
                <p className="text-sm text-muted-foreground mb-4">Headings, buttons, labels — Bold weights (600–800)</p>
                <p className="text-lg font-mono text-foreground mb-1">Secondary: JetBrains Mono</p>
                <p className="text-sm text-muted-foreground">Code blocks, tokens, data — Regular weight (400)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TypographySection;
