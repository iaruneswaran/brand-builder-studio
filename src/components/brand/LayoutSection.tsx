import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';

interface LayoutSectionProps { palette: BrandPalette }

const LayoutSection = ({ palette }: LayoutSectionProps) => {
  const p500 = palette.primary[500];
  const p50 = palette.primary[50];
  const p100 = palette.primary[100];
  const n200 = palette.neutrals[200];
  const n900 = palette.neutrals[900];

  return (
    <section className="w-full bg-background section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Layout & Grids</h2>
        <p className="text-muted-foreground mb-8">12-column grid, 8px spacing, and elevation system.</p>

        <div className="grid grid-cols-12 gap-8">
          {/* Grid demo */}
          <div className="col-span-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">12-Column Grid</p>
            <div className="grid grid-cols-12 gap-2 mb-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-16 flex items-center justify-center text-xs font-mono font-bold" style={{ backgroundColor: p100, color: getContrastTextColor(p100) }}>{i + 1}</div>
              ))}
            </div>

            {/* Layout examples */}
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Section Layout Examples</p>
            <div className="space-y-4">
              {/* Hero */}
              <div className="h-32 flex items-center px-8" style={{ backgroundColor: p500 }}>
                <div>
                  <p className="text-lg font-extrabold" style={{ color: getContrastTextColor(p500) }}>Hero Section</p>
                  <p className="text-sm opacity-80" style={{ color: getContrastTextColor(p500) }}>Full-width with CTA</p>
                </div>
              </div>
              {/* Content + sidebar */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 h-24 p-4 border-2 border-border bg-card">
                  <p className="text-xs font-bold text-muted-foreground">Content Area (8 cols)</p>
                </div>
                <div className="col-span-4 h-24 p-4" style={{ backgroundColor: p50 }}>
                  <p className="text-xs font-bold" style={{ color: getContrastTextColor(p50) }}>Sidebar (4 cols)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing + Elevation */}
          <div className="col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Spacing System (8px)</p>
            <div className="space-y-2 mb-8">
              {[4, 8, 16, 24, 32, 48, 64, 96].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <div className="h-4" style={{ width: `${s}px`, backgroundColor: p500 }} />
                  <span className="text-xs font-mono text-muted-foreground">{s}px</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Elevation</p>
            <div className="space-y-4">
              <div className="h-16 bg-card border border-border p-4 shadow-hard-sm">
                <p className="text-xs font-bold text-foreground">Elevation 1 — Card</p>
              </div>
              <div className="h-16 bg-card border border-border p-4 shadow-hard">
                <p className="text-xs font-bold text-foreground">Elevation 2 — Dropdown</p>
              </div>
              <div className="h-16 bg-card border border-border p-4 shadow-hard-lg">
                <p className="text-xs font-bold text-foreground">Elevation 3 — Modal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LayoutSection;
