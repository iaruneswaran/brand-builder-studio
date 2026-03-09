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
    <section className="w-full bg-card section-padding mt-12 pt-12">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">Data Visualization</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Charts using the primary scale with accent highlights. Follow contrast guidelines and 8px grid alignment.</p>

        <div className="grid grid-cols-12 gap-12">
          {/* Bar chart */}
          <div className="col-span-12 lg:col-span-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Comparative Scaling — Bar Chart</p>
            <div className="bg-background p-8 shadow-hard">
              <div className="flex items-end gap-3 h-48">
                {barData.map((val, i) => {
                  const isHighlight = i === 4;
                  const color = isHighlight ? palette.accentA[600] : palette.primary[500];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">{val}</span>
                      <div className="w-full transition-all" style={{ height: `${(val / maxBar) * 160}px`, backgroundColor: color }} />
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">{'SMTWTFS'[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Line chart (simplified) */}
          <div className="col-span-12 lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">System Momentum — Trend Line</p>
            <div className="bg-background p-8 shadow-hard">
              <svg viewBox="0 0 300 150" className="w-full h-48 overflow-visible">
                {/* Grid */}
                {[0, 37.5, 75, 112.5, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={palette.neutrals[200]} strokeWidth="1" opacity="0.5" />
                ))}
                {/* Primary line */}
                <polyline fill="none" stroke={palette.primary[500]} strokeWidth="3" points="0,120 50,90 100,100 150,60 200,70 250,30 300,45" />
                {/* Accent highlight point */}
                <rect x="246" y="26" width="8" height="8" fill={palette.accentA[600]} />
                {/* Area */}
                <polygon fill={palette.primary[500]} opacity="0.1" points="0,120 50,90 100,100 150,60 200,70 250,30 300,45 300,150 0,150" />
              </svg>
            </div>
          </div>

          {/* Guidelines */}
          <div className="col-span-12 lg:col-span-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Standard Guidelines</p>
            <div className="space-y-6">
              <div className="p-5 bg-background shadow-hard-sm">
                <p className="text-[10px] font-bold uppercase text-success mb-2 tracking-widest">✓ Do</p>
                <p className="text-sm text-foreground leading-snug">Use primary scale for data series. Reserve accent for highlights and key data points.</p>
              </div>
              <div className="p-5 bg-background shadow-hard-sm">
                <p className="text-[10px] font-bold uppercase text-danger mb-2 tracking-widest">✗ Don't</p>
                <p className="text-sm text-foreground leading-snug">Mix too many hues. Keep saturation consistent across series for readability.</p>
              </div>
              <div className="p-5 bg-background shadow-hard-sm">
                <p className="text-[10px] font-bold uppercase text-warning mb-2 tracking-widest">⚠ Contrast</p>
                <p className="text-sm text-foreground leading-snug">Ensure all data labels meet AA contrast on their background surface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataVizSection;
