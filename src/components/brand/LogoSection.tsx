import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';
import { Box, Circle, Hexagon, Square, Triangle, Shield, Zap, Target } from 'lucide-react';

interface LogoSectionProps { palette: BrandPalette }

const LogoSection = ({ palette }: LogoSectionProps) => {
    const p500 = palette.primary[500];
    const p600 = palette.primary[600];
    const p100 = palette.primary[100];
    const a400 = palette.accentA[400];

    const logoMarks = [
        { icon: Zap, label: 'Dynamic' },
        { icon: Shield, label: 'Secure' },
        { icon: Target, label: 'Focused' },
        { icon: Hexagon, label: 'Structured' },
        { icon: Box, label: 'Solid' },
        { icon: Circle, label: 'Infinite' },
    ];

    return (
        <section className="w-full bg-background section-padding mt-12 pt-12">
            <div className="max-w-[1920px] mx-auto px-12">
                <h2 className="text-4xl font-extrabold text-foreground mb-4">Logo & Marks</h2>
                <p className="text-muted-foreground mb-12 max-w-2xl">Visual identifiers and iconography generators based on brand geometry. Always maintain sharp corners on all framing elements.</p>

                <div className="grid grid-cols-12 gap-12">
                    {/* Primary Logo Variations */}
                    <div className="col-span-12 lg:col-span-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Execution — Logo Variations</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Light Background */}
                            <div className="aspect-square bg-white flex flex-col items-center justify-center p-8 shadow-hard hover:shadow-hard-lg transition-all">
                                <div className="w-20 h-20 mb-6 flex items-center justify-center" style={{ color: palette.primary[500] }}>
                                    <Zap className="w-full h-full" strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Primary Mark</span>
                            </div>

                            {/* Dark Background */}
                            <div className="aspect-square flex flex-col items-center justify-center p-8 shadow-hard" style={{ backgroundColor: palette.primary[600] }}>
                                <div className="w-20 h-20 mb-6 flex items-center justify-center" style={{ color: '#FAFAFA' }}>
                                    <Zap className="w-full h-full" strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#FAFAFA' }}>Reverse Mark</span>
                            </div>

                            {/* Accent Background */}
                            <div className="aspect-square flex flex-col items-center justify-center p-8 shadow-hard" style={{ backgroundColor: palette.accentA[400] }}>
                                <div className="w-20 h-20 mb-6 flex items-center justify-center" style={{ color: '#FAFAFA' }}>
                                    <Zap className="w-full h-full" strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#FAFAFA' }}>Accent Mark</span>
                            </div>

                            {/* Outline */}
                            <div className="aspect-square bg-white flex flex-col items-center justify-center p-8 shadow-hard">
                                <div className="w-20 h-20 mb-6 flex items-center justify-center" style={{ color: palette.primary[500] }}>
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                        <Zap className="w-10 h-10" />
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Framed Mark</span>
                            </div>
                        </div>
                    </div>

                    {/* Iconography System */}
                    <div className="col-span-12 lg:col-span-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">Core — Iconography System</p>
                        <div className="bg-white p-8 shadow-hard grid grid-cols-3 gap-8">
                            {logoMarks.map((mark, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
                                    <div className="w-12 h-12 flex items-center justify-center transition-all group-hover:bg-primary-50" style={{ backgroundColor: palette.primary[50], color: palette.primary[500] }}>
                                        <mark.icon className="w-7 h-7" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider transition-colors group-hover:text-primary">{mark.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LogoSection;
