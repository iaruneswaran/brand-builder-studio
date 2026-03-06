import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';

interface DataVizSectionProps { palette: BrandPalette }

const DataVizSection = ({ palette }: DataVizSectionProps) => {
  const p300 = palette.primary[300];
  const p500 = palette.primary[500];
  const p700 = palette.primary[700];
  const a600 = palette.accentA[600];
  const n200 = palette.neutrals[200];

  const barData = [65, 45, 80, 55, 90, 70, 85];
  const maxBar = Math.max(...barData);

  return (
    <section className="w-full bg-card section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Data Visualization</h2>
        <p className="text-muted-foreground mb-8">Charts using the primary scale with accent highlights. Follow contrast guidelines.</p>

        <div className="grid grid-cols-12 gap-8">
          {/* Bar chart */}
          <div className="col-span-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Bar Chart</p>
            <div className="bg-background border border-border p-6">
              <div className="flex items-end gap-3 h-48">
                {barData.map((val, i) => {
                  const isHighlight = i === 4;
                  const color = isHighlight ? a600 : p500;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{val}</span>
                      <div className="w-full transition-all" style={{ height: `${(val / maxBar) * 160}px`, backgroundColor: color }} />
                      <span className="text-[10px] font-mono text-muted-foreground">{'SMTWTFS'[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Line chart (simplified) */}
          <div className="col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Trend Line</p>
            <div className="bg-background border border-border p-6">
              <svg viewBox="0 0 300 150" className="w-full h-48">
                {/* Grid */}
                {[0, 37.5, 75, 112.5, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={n200} strokeWidth="1" />
                ))}
                {/* Primary line */}
                <polyline fill="none" stroke={p500} strokeWidth="3" points="0,120 50,90 100,100 150,60 200,70 250,30 300,45" />
                {/* Accent highlight point */}
                <rect x="246" y="26" width="8" height="8" fill={a600} />
                {/* Area */}
                <polygon fill={p500} opacity="0.08" points="0,120 50,90 100,100 150,60 200,70 250,30 300,45 300,150 0,150" />
              </svg>
            </div>
          </div>

          {/* Do/Don't */}
          <div className="col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Guidelines</p>
            <div className="space-y-4">
              <div className="border-l-4 p-4 bg-background" style={{ borderColor: palette.feedback.success }}>
                <p className="text-xs font-bold uppercase text-foreground mb-1">✓ Do</p>
                <p className="text-sm text-muted-foreground">Use primary scale for data series. Reserve accent for highlights and key data points.</p>
              </div>
              <div className="border-l-4 p-4 bg-background" style={{ borderColor: palette.feedback.danger }}>
                <p className="text-xs font-bold uppercase text-foreground mb-1">✗ Don't</p>
                <p className="text-sm text-muted-foreground">Mix too many hues. Keep saturation consistent across series for readability.</p>
              </div>
              <div className="border-l-4 p-4 bg-background" style={{ borderColor: palette.feedback.warning }}>
                <p className="text-xs font-bold uppercase text-foreground mb-1">⚠ Contrast</p>
                <p className="text-sm text-muted-foreground">Ensure all data labels meet AA contrast on their background surface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataVizSection;
