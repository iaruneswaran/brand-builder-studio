import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';
import { ArrowRight, Check, Star } from 'lucide-react';

interface PageTemplatesSectionProps { palette: BrandPalette }

const PageTemplatesSection = ({ palette }: PageTemplatesSectionProps) => {
  const p500 = palette.primary[500];
  const p700 = palette.primary[700];
  const p50 = palette.primary[50];
  const a600 = palette.accentA[600];
  const n50 = palette.neutrals[50];
  const n900 = palette.neutrals[900];

  return (
    <section className="w-full bg-card section-padding mt-12 pt-12">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">Website Infrastructure</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Sample screens applying the palette with strict 0px border-radius. High-precision layouts for enterprise-grade digital products.</p>

        <div className="space-y-12">
          {/* Landing Hero */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Template A — Hero Communication</p>
            <div className="h-[400px] flex items-center px-20 relative overflow-hidden shadow-hard" style={{ backgroundColor: palette.primary[700] }}>
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-5xl font-extrabold mb-6 leading-tight" style={{ color: '#FAFAFA' }}>Build something<br />extraordinary.</h3>
                <p className="text-xl mb-10 opacity-80 leading-relaxed max-w-lg" style={{ color: '#FAFAFA' }}>Create professional brand guides in minutes with automated color systems and design tokens optimized for performance.</p>
                <div className="flex gap-4">
                  <button className="h-14 px-10 font-bold text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-hard-sm transition-all hover:bg-white hover:text-black" style={{ backgroundColor: palette.accentA[600], color: '#FAFAFA' }}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="h-14 px-10 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-white/10" style={{ color: '#FAFAFA', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    Learn More
                  </button>
                </div>
              </div>
              {/* Abstract geometry */}
              <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-white" style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }} />
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Template B — Feature Matrix</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-neutral-50 shadow-hard">
              {['Color Systems', 'Typography Scale', 'Component Library', 'Design Tokens', 'Export Options', 'Accessibility'].map((feat, i) => (
                <div key={feat} className="p-10 bg-white shadow-hard-sm hover:translate-y-[-4px] transition-all">
                  <div className="w-12 h-12 mb-6 flex items-center justify-center shadow-hard-sm" style={{ backgroundColor: i % 2 === 0 ? palette.primary[500] : palette.accentA[600] }}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">{feat}</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">Automated generation with AA+ contrast compliance and export-ready tokens. Performance-first architecture.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTemplatesSection;
