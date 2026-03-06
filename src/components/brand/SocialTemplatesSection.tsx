import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';
import { ArrowRight } from 'lucide-react';

interface SocialTemplatesSectionProps { palette: BrandPalette }

const SocialTemplatesSection = ({ palette }: SocialTemplatesSectionProps) => {
  const p500 = palette.primary[500];
  const p700 = palette.primary[700];
  const a400 = palette.accentA[400];
  const a600 = palette.accentA[600];
  const b400 = palette.accentB[400];
  const s500 = palette.secondary[500];
  const n900 = palette.neutrals[900];
  const n50 = palette.neutrals[50];

  return (
    <section className="w-full bg-background section-rhythm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Page Templates — Social & Marketing</h2>
        <p className="text-muted-foreground mb-8">Social tiles and marketing assets using sharp-edged masks and multi-color compositions.</p>

        <div className="grid grid-cols-3 gap-6">
          {/* Tile 1 - Bold split */}
          <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: p700 }}>
            <div className="absolute bottom-0 left-0 w-full h-1/2" style={{ backgroundColor: a600 }} />
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getContrastTextColor(p700) }}>Announcement</span>
              <div>
                <h3 className="text-3xl font-extrabold mb-3" style={{ color: getContrastTextColor(a600) }}>New Feature Launch</h3>
                <button className="h-10 px-6 font-bold text-xs flex items-center gap-2" style={{ backgroundColor: n50, color: n900 }}>
                  Learn More <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Tile 2 - Grid blocks */}
          <div className="aspect-square relative overflow-hidden grid grid-cols-2 grid-rows-2">
            <div style={{ backgroundColor: p500 }} className="p-4 flex items-end">
              <span className="text-xs font-bold" style={{ color: getContrastTextColor(p500) }}>Design</span>
            </div>
            <div style={{ backgroundColor: a400 }} className="p-4 flex items-end">
              <span className="text-xs font-bold" style={{ color: getContrastTextColor(a400) }}>Develop</span>
            </div>
            <div style={{ backgroundColor: s500 }} className="p-4 flex items-end">
              <span className="text-xs font-bold" style={{ color: getContrastTextColor(s500) }}>Deploy</span>
            </div>
            <div style={{ backgroundColor: b400 }} className="p-4 flex items-end">
              <span className="text-xs font-bold" style={{ color: getContrastTextColor(b400) }}>Scale</span>
            </div>
          </div>

          {/* Tile 3 - Diagonal text */}
          <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: n900 }}>
            <div className="absolute inset-0 p-8 flex flex-col justify-between">
              <div className="w-12 h-2" style={{ backgroundColor: a600 }} />
              <div>
                <h3 className="text-4xl font-extrabold leading-tight" style={{ color: n50 }}>Think<br />Bold.</h3>
                <div className="w-24 h-2 mt-4" style={{ backgroundColor: p500 }} />
              </div>
              <span className="text-xs font-bold tracking-widest" style={{ color: n50, opacity: 0.5 }}>BRANDGUIDE.IO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialTemplatesSection;
