import { BrandPalette } from '@/lib/colorUtils';

const TypographySection = ({ palette }: { palette: BrandPalette }) => {
  return (
    <section className="w-full bg-background section-padding mt-12 pt-12">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Typography</h2>
        <p className="text-muted-foreground mb-12">Type scale with Plus Jakarta Sans. Pair with a monospace for code and data.</p>

        <div className="grid grid-cols-12 gap-12">
          {/* Main Scale */}
          <div className="col-span-8 space-y-12">
            {/* ... (Main scale items) */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Display — 72px / 1.0</span>
                <span className="text-[10px] font-mono bg-muted px-2 py-1">Bold 800</span>
              </div>
              <h1 className="text-[72px] leading-[1.0] font-extrabold" style={{ color: palette.primary[900] }}>Brand Guide</h1>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">H1 — 48px / 1.1</span>
              </div>
              <h1 className="text-[48px] leading-[1.1] font-bold">Heading One</h1>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">H2 — 36px / 1.2</span>
              </div>
              <h2 className="text-[36px] leading-[1.2] font-bold">Heading Two</h2>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Body — 16px / 1.6</span>
                <span className="text-[10px] font-mono bg-muted px-2 py-1">Regular 400</span>
              </div>
              <p className="text-[16px] leading-[1.6] max-w-2xl">
                The quick brown fox jumps over the lazy dog. This is body text used for paragraphs and content blocks. All typography follows the strict 8px grid alignment.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Caption — 12px / 1.5</span>
              </div>
              <caption className="text-[12px] leading-[1.5] uppercase tracking-wider block text-left">Caption text — Metadata</caption>
            </div>
          </div>

          {/* Pairing & Surfaces */}
          <div className="col-span-4 space-y-10">
            <div className="p-8 bg-card shadow-hard">
              <h3 className="text-sm font-mono text-muted-foreground mb-6 uppercase tracking-widest">Font Pairing</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">Primary</p>
                  <p className="text-xl font-bold">Plus Jakarta Sans</p>
                  <p className="text-xs text-muted-foreground mt-1">Headings, buttons, labels — Bold weights (600–800)</p>
                </div>
                <div className="pt-6">
                  <p className="text-xs font-mono text-muted-foreground mb-2">Secondary</p>
                  <p className="text-xl font-mono">JetBrains Mono</p>
                  <p className="text-xs text-muted-foreground mt-1">Code blocks, tokens, data — Regular weight (400)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">On Light Surface</h3>
              <div className="p-6 bg-white shadow-hard-sm">
                <p className="text-lg font-bold mb-2">Sample Heading</p>
                <p className="text-sm text-neutral-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</p>
              </div>

              <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest pt-4">On Dark Surface</h3>
              <div className="p-6 bg-neutral-900 shadow-hard-sm">
                <p className="text-lg font-bold mb-2 text-white">Sample Heading</p>
                <p className="text-sm text-neutral-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TypographySection;
