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
    <section className="w-full bg-card section-padding border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">UI Components</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Precision components styled with the generated palette. All edges are sharp — strict zero border-radius requirement.</p>

        <div className="grid grid-cols-12 gap-12">
          {/* Buttons */}
          <div className="col-span-12 lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Interactive — Buttons</p>
            <div className="space-y-4">
              <button className="w-full h-12 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all" style={{ backgroundColor: palette.primary[500], color: '#FAFAFA' }}>
                Primary Button <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full h-12 font-bold text-xs uppercase tracking-widest border border-primary flex items-center justify-center gap-2 bg-transparent text-primary hover:bg-primary/5 transition-all">
                Secondary Button
              </button>
              <button className="w-full h-12 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-foreground hover:bg-neutral-100 transition-colors bg-transparent border border-transparent">
                Ghost Button
              </button>
              <button className="w-full h-12 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all" style={{ backgroundColor: palette.accentA[600], color: '#FAFAFA' }}>
                Accent CTA <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full h-12 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 opacity-30 cursor-not-allowed bg-neutral-400 text-white">
                Disabled State
              </button>
            </div>
          </div>

          {/* Form elements */}
          <div className="col-span-12 lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Input Systems — Forms</p>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-2 block">Text Entry</label>
                <div className="flex items-center border border-border h-12 px-4 bg-background shadow-hard-sm focus-within:border-primary transition-colors">
                  <Search className="w-4 h-4 text-muted-foreground mr-3" />
                  <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-2 block">Selection</label>
                <div className="flex items-center justify-between border border-border h-12 px-4 bg-background cursor-pointer shadow-hard-sm hover:border-neutral-400 transition-colors">
                  <span className="text-sm text-neutral-500">Select option</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-5 h-5 border border-primary flex items-center justify-center transition-all" style={{ backgroundColor: palette.primary[500] }}>
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">Checkbox checked</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-5 h-5 border border-border bg-background group-hover:border-neutral-400 transition-all" />
                <span className="text-sm font-medium text-neutral-600">Checkbox unchecked</span>
              </div>
              {/* Toggle */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-6 flex items-center px-0.5 border border-primary bg-primary" style={{ backgroundColor: palette.primary[500], borderColor: palette.primary[600] }}>
                  <div className="ml-auto w-5 h-5 bg-white shadow-sm" />
                </div>
                <span className="text-sm font-bold text-foreground">Toggle on</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-6 flex items-center px-0.5 border border-neutral-300 bg-neutral-200">
                  <div className="w-5 h-5 bg-white shadow-sm" />
                </div>
                <span className="text-sm font-medium text-neutral-600">Toggle off</span>
              </div>
            </div>
          </div>

          {/* Chips, Tabs, Feedback */}
          <div className="col-span-12 lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Navigation & Feedback</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {['Design', 'Development', 'Brand', 'Marketing'].map((tag, i) => (
                <span key={tag} className={`h-8 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center border transition-all cursor-pointer ${i === 0 ? 'bg-primary text-white border-primary shadow-hard-sm' : 'bg-transparent text-neutral-600 border-neutral-300 hover:border-neutral-400'
                  }`} style={{
                    backgroundColor: i === 0 ? palette.accentA[400] : 'transparent',
                    borderColor: i === 0 ? palette.accentA[400] : undefined,
                    color: i === 0 ? '#FAFAFA' : undefined
                  }}>{tag}</span>
              ))}
            </div>

            <div className="flex border-b border-border mb-8">
              {['Overview', 'Tokens', 'Export'].map((tab, i) => (
                <div key={tab} className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all" style={{
                  color: i === 0 ? palette.primary[500] : 'hsl(var(--neutral-400))',
                  borderBottom: i === 0 ? `3px solid ${palette.primary[500]}` : '3px solid transparent',
                }}>{tab}</div>
              ))}
            </div>

            <div className="space-y-3">
              {([['success', 'Operation completed', palette.feedback.success],
              ['warning', 'Check your input', palette.feedback.warning],
              ['danger', 'Action failed', palette.feedback.danger],
              ['info', 'New update available', palette.feedback.info],
              ] as const).map(([type, msg, color]) => (
                <div key={type} className="h-11 px-4 flex items-center text-xs font-bold border border-black/5 shadow-hard-sm" style={{
                  backgroundColor: color + '0a',
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
