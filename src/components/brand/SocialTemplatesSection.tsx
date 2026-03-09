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
    <section className="w-full bg-background section-padding mt-12 pt-12">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">Marketing & Social</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Social tiles and marketing assets using sharp-edged masks and multi-color compositions. Optimized for high-impact brand presence.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tile 1 - Bold split */}
          <div className="aspect-square relative overflow-hidden shadow-hard group cursor-pointer" style={{ backgroundColor: palette.primary[700] }}>
            <div className="absolute bottom-0 left-0 w-full h-1/2 transition-transform group-hover:translate-y-2" style={{ backgroundColor: palette.accentA[600] }} />
            <div className="absolute inset-0 p-10 flex flex-col justify-between z-10 text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Announcement</span>
              <div>
                <h3 className="text-4xl font-extrabold mb-6 leading-tight">New Feature<br />Production</h3>
                <button className="h-12 px-8 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-hard-sm transition-all hover:bg-white hover:text-black" style={{ backgroundColor: '#FAFAFA', color: '#111827' }}>
                  Learn More <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tile 2 - Grid blocks */}
          <div className="aspect-square relative overflow-hidden grid grid-cols-2 grid-rows-2 shadow-hard">
            <div style={{ backgroundColor: palette.primary[500] }} className="p-8 flex flex-col justify-end transition-opacity hover:opacity-90 cursor-not-allowed">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Design</span>
            </div>
            <div style={{ backgroundColor: palette.accentA[400] }} className="p-8 flex flex-col justify-end transition-opacity hover:opacity-90 cursor-not-allowed">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Develop</span>
            </div>
            <div style={{ backgroundColor: palette.secondary[500] }} className="p-8 flex flex-col justify-end transition-opacity hover:opacity-90 cursor-not-allowed">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Deploy</span>
            </div>
            <div style={{ backgroundColor: palette.accentB[400] }} className="p-8 flex flex-col justify-end transition-opacity hover:opacity-90 cursor-not-allowed">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white">Scale</span>
            </div>
          </div>

          {/* Tile 3 - Diagonal text */}
          <div className="aspect-square relative overflow-hidden shadow-hard cursor-pointer group" style={{ backgroundColor: '#111827' }}>
            <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
              <div className="w-16 h-2 transition-all group-hover:w-24" style={{ backgroundColor: palette.accentA[600] }} />
              <div>
                <h3 className="text-5xl font-extrabold leading-tight tracking-tighter mb-4">Think<br />Bold.</h3>
                <div className="w-32 h-2" style={{ backgroundColor: palette.primary[500] }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.4em] opacity-40">BRANDBUILDER.PRO</span>
                <span className="text-[10px] font-mono opacity-40">2026.SYS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialTemplatesSection;
