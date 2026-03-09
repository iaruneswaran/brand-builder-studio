import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';

interface LayoutSectionProps { palette: BrandPalette }

const LayoutSection = ({ palette }: LayoutSectionProps) => {
  const p500 = palette.primary[500];
  const p50 = palette.primary[50];
  const p100 = palette.primary[100];
  const n200 = palette.neutrals[200];
  const n900 = palette.neutrals[900];

  return (
    <section className="w-full bg-background section-padding mt-12 pt-12 text-foreground">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold mb-4">Layout & Grids</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">A precision measurement system built on an 8px grid. Use the 12-column foundation for all layouts.</p>

        <div className="grid grid-cols-12 gap-12">
          {/* Grid demo */}
          <div className="col-span-12 lg:col-span-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Structural Foundation — 12-Column Grid</p>
            <div className="grid grid-cols-12 gap-3 mb-10">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-24 flex items-center justify-center text-[11px] font-mono font-bold bg-primary/5 text-primary">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Layout examples */}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Execution Examples</p>
            <div className="space-y-6">
              {/* Hero */}
              <div className="h-40 flex items-center px-10 shadow-hard" style={{ backgroundColor: palette.primary[500] }}>
                <div>
                  <p className="text-2xl font-bold mb-1" style={{ color: '#FAFAFA' }}>Hero Section</p>
                  <p className="text-sm opacity-80" style={{ color: '#FAFAFA' }}>Full-width with CTA</p>
                </div>
              </div>
              {/* Content + sidebar */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 h-32 p-6 bg-white shadow-hard">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Content Area (8 cols)</p>
                </div>
                <div className="col-span-4 h-32 p-6 bg-neutral-100 shadow-hard-sm">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Sidebar (4 cols)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing + Elevation */}
          <div className="col-span-12 lg:col-span-4 lg:pl-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Spacing System (8px)</p>
            <div className="space-y-4 mb-12">
              {[4, 8, 16, 24, 32, 48, 64, 96].map(s => (
                <div key={s} className="flex items-center gap-4 group">
                  <div className="h-4 bg-primary transition-all group-hover:bg-primary-600" style={{ width: `${s}px`, backgroundColor: palette.primary[500] }} />
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{s}px</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Elevation System</p>
            <div className="space-y-6">
              <div className="h-20 bg-white p-5 shadow-hard-sm flex flex-col justify-center">
                <p className="text-sm font-bold">Elevation 1</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Level: Card / Surface</p>
              </div>
              <div className="h-20 bg-white p-5 shadow-hard flex flex-col justify-center">
                <p className="text-sm font-bold">Elevation 2</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Level: Dropdown / Hover</p>
              </div>
              <div className="h-20 bg-white p-5 shadow-hard-lg flex flex-col justify-center">
                <p className="text-sm font-bold">Elevation 3</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Level: Modal / Popover</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LayoutSection;
