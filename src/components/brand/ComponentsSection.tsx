import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';
import { ChevronDown, Check, Search, ArrowRight } from 'lucide-react';

interface ComponentsSectionProps { palette: BrandPalette }

const ComponentsSection = ({ palette }: ComponentsSectionProps) => {
  const p500 = palette.primary[500];
  const p700 = palette.primary[700];
  const a400 = palette.accentA[400];
  const a600 = palette.accentA[600];
  const n50 = palette.neutrals[50];
  const n200 = palette.neutrals[200];
  const n900 = palette.neutrals[900];

  return (
    <section className="w-full bg-card section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Components</h2>
        <p className="text-muted-foreground mb-8">UI components styled with the generated palette. All edges are sharp — zero border-radius.</p>

        <div className="grid grid-cols-12 gap-8">
          {/* Buttons */}
          <div className="col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Buttons</p>
            <div className="space-y-3">
              <button className="w-full h-12 font-bold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: p500, color: getContrastTextColor(p500) }}>
                Primary Button <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full h-12 font-bold text-sm border-2 flex items-center justify-center gap-2" style={{ borderColor: p500, color: p500, backgroundColor: 'transparent' }}>
                Secondary Button
              </button>
              <button className="w-full h-12 font-bold text-sm flex items-center justify-center gap-2 text-foreground hover:bg-muted transition-colors bg-transparent">
                Ghost Button
              </button>
              <button className="w-full h-12 font-bold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: a600, color: getContrastTextColor(a600) }}>
                Accent CTA <ArrowRight className="w-4 h-4" />
              </button>
              {/* Disabled */}
              <button className="w-full h-12 font-bold text-sm flex items-center justify-center gap-2 opacity-40 cursor-not-allowed" style={{ backgroundColor: p500, color: getContrastTextColor(p500) }}>
                Disabled
              </button>
            </div>
          </div>

          {/* Form elements */}
          <div className="col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Form Elements</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Text Input</label>
                <div className="flex items-center border-2 border-border h-12 px-3 bg-background">
                  <Search className="w-4 h-4 text-muted-foreground mr-2" />
                  <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-foreground text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Dropdown</label>
                <div className="flex items-center justify-between border-2 border-border h-12 px-3 bg-background cursor-pointer">
                  <span className="text-sm text-muted-foreground">Select option</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-border flex items-center justify-center" style={{ backgroundColor: p500, borderColor: p500 }}>
                  <Check className="w-3 h-3" style={{ color: getContrastTextColor(p500) }} />
                </div>
                <span className="text-sm text-foreground">Checkbox checked</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-border bg-background" />
                <span className="text-sm text-foreground">Checkbox unchecked</span>
              </div>
              {/* Toggle */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-6 relative" style={{ backgroundColor: p500 }}>
                  <div className="absolute right-0.5 top-0.5 w-5 h-5" style={{ backgroundColor: getContrastTextColor(p500) }} />
                </div>
                <span className="text-sm text-foreground">Toggle on</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-6 relative bg-muted">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Toggle off</span>
              </div>
            </div>
          </div>

          {/* Chips, Tabs, Tags */}
          <div className="col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Chips & Tabs</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Design', 'Development', 'Brand', 'Marketing'].map((tag, i) => (
                <span key={tag} className="h-8 px-4 text-xs font-bold flex items-center" style={{
                  backgroundColor: i === 0 ? a400 : 'transparent',
                  color: i === 0 ? getContrastTextColor(a400) : a600,
                  border: i === 0 ? 'none' : `2px solid ${a400}`,
                }}>{tag}</span>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Tabs</p>
            <div className="flex border-b-2 border-border mb-6">
              {['Overview', 'Tokens', 'Export'].map((tab, i) => (
                <div key={tab} className="px-6 py-3 text-sm font-bold cursor-pointer" style={{
                  color: i === 0 ? p500 : 'hsl(var(--muted-foreground))',
                  borderBottom: i === 0 ? `3px solid ${p500}` : '3px solid transparent',
                  marginBottom: '-2px',
                }}>{tab}</div>
              ))}
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Feedback States</p>
            <div className="space-y-2">
              {([['success', 'Operation completed', palette.feedback.success],
                ['warning', 'Check your input', palette.feedback.warning],
                ['danger', 'Action failed', palette.feedback.danger],
                ['info', 'New update available', palette.feedback.info],
              ] as const).map(([type, msg, color]) => (
                <div key={type} className="h-10 px-4 flex items-center text-sm font-medium" style={{
                  backgroundColor: color + '1a',
                  color: color,
                  borderLeft: `4px solid ${color}`,
                }}>{msg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComponentsSection;
