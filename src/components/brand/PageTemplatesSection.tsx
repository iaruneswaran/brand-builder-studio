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
    <section className="w-full bg-card section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Page Templates — Website</h2>
        <p className="text-muted-foreground mb-8">Sample screens applying the palette with strict 0px border-radius.</p>

        <div className="space-y-8">
          {/* Landing Hero */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Landing Hero</p>
            <div className="h-[280px] flex items-center px-16 relative overflow-hidden" style={{ backgroundColor: p700 }}>
              <div className="relative z-10 max-w-xl">
                <h3 className="text-4xl font-extrabold mb-4" style={{ color: getContrastTextColor(p700) }}>Build something extraordinary</h3>
                <p className="text-lg mb-6 opacity-80" style={{ color: getContrastTextColor(p700) }}>Create professional brand guides in minutes with automated color systems and design tokens.</p>
                <div className="flex gap-3">
                  <button className="h-12 px-8 font-bold text-sm flex items-center gap-2" style={{ backgroundColor: a600, color: getContrastTextColor(a600) }}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="h-12 px-8 font-bold text-sm border-2 flex items-center gap-2" style={{ borderColor: getContrastTextColor(p700), color: getContrastTextColor(p700), backgroundColor: 'transparent' }}>
                    Learn More
                  </button>
                </div>
              </div>
              <div className="absolute right-16 top-6 w-64 h-64 opacity-10" style={{ backgroundColor: getContrastTextColor(p700) }} />
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Features Grid</p>
            <div className="grid grid-cols-3 gap-4 p-8" style={{ backgroundColor: n50 }}>
              {['Color Systems', 'Typography Scale', 'Component Library', 'Design Tokens', 'Export Options', 'Accessibility'].map((feat, i) => (
                <div key={feat} className="p-6 bg-card border border-border shadow-hard-sm">
                  <div className="w-10 h-10 mb-4 flex items-center justify-center" style={{ backgroundColor: i % 2 === 0 ? p500 : a600 }}>
                    <Star className="w-5 h-5" style={{ color: getContrastTextColor(i % 2 === 0 ? p500 : a600) }} />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{feat}</h4>
                  <p className="text-sm text-muted-foreground">Automated generation with AA+ contrast compliance and export-ready tokens.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Pricing</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Starter', price: 'Free', features: ['1 palette', 'CSS export', 'Basic tokens'] },
                { name: 'Pro', price: '$19/mo', features: ['Unlimited palettes', 'All exports', 'Components', 'Templates'], featured: true },
                { name: 'Team', price: '$49/mo', features: ['Everything in Pro', 'Collaboration', 'Figma sync', 'API access'] },
              ].map(plan => (
                <div key={plan.name} className="p-8 border-2 flex flex-col" style={{
                  borderColor: plan.featured ? p500 : 'hsl(var(--border))',
                  backgroundColor: plan.featured ? p50 : 'hsl(var(--card))',
                }}>
                  {plan.featured && <span className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: p500 }}>Most Popular</span>}
                  <h4 className="text-xl font-bold text-foreground">{plan.name}</h4>
                  <p className="text-3xl font-extrabold text-foreground mt-2 mb-6">{plan.price}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: p500 }} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full h-12 font-bold text-sm" style={{
                    backgroundColor: plan.featured ? p500 : 'transparent',
                    color: plan.featured ? getContrastTextColor(p500) : p500,
                    border: plan.featured ? 'none' : `2px solid ${p500}`,
                  }}>Choose Plan</button>
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
