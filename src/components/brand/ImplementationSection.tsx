import { BrandPalette, getContrastTextColor } from '@/lib/colorUtils';
import { ArrowRight } from 'lucide-react';

const ImplementationSection = ({ palette }: { palette: BrandPalette }) => {
    const p500 = palette.primary[500];
    const n50 = palette.neutrals[50];
    const n900 = palette.neutrals[900];

    return (
        <section className="w-full bg-background section-padding mt-12 pt-12">
            <div className="max-w-[1920px] mx-auto px-12">
                <h2 className="text-4xl font-extrabold text-foreground mb-4">Implementation</h2>
                <p className="text-muted-foreground mb-12 max-w-2xl">Core visual markers for system implementation. Baseline standards for backgrounds, surfaces, and interaction.</p>

                <div className="grid grid-cols-12 gap-12 mb-12">
                    {/* Background */}
                    <div className="col-span-12 lg:col-span-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Environment — Background</p>
                        <div className="h-48 flex items-center justify-center p-8 shadow-hard bg-white">
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground">Background Layer</p>
                                <p className="text-[10px] font-mono text-neutral-400 mt-1">#FFFFFF / Neutrals-50</p>
                            </div>
                        </div>
                    </div>

                    {/* Surface */}
                    <div className="col-span-12 lg:col-span-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Component — Surface</p>
                        <div className="h-48 flex items-center justify-center p-8 shadow-hard" style={{ backgroundColor: n50 }}>
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground">Surface Layer</p>
                                <p className="text-[10px] font-mono text-neutral-400 mt-1">{n50} / Level 1</p>
                            </div>
                        </div>
                    </div>

                    {/* Text Primary */}
                    <div className="col-span-12 lg:col-span-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Legibility — Text Primary</p>
                        <div className="h-48 p-8 shadow-hard bg-white flex flex-col justify-center">
                            <p className="text-2xl font-extrabold leading-tight text-foreground">High contrast typographic baseline.</p>
                            <p className="text-[10px] font-mono text-neutral-400 mt-4">{n900} / 100% Contrast</p>
                        </div>
                    </div>
                </div>

                {/* Feedback States */}
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">System — Feedback States</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Success', color: palette.feedback.success, tag: 'AAA' },
                            { label: 'Warning', color: palette.feedback.warning, tag: 'AAA' },
                            { label: 'Danger', color: palette.feedback.danger, tag: 'AA' },
                            { label: 'Info', color: palette.feedback.info, tag: 'AAA' },
                        ].map((state) => (
                            <div key={state.label} className="p-6 shadow-hard bg-white flex flex-col items-center gap-4">
                                <div className="w-12 h-12" style={{ backgroundColor: state.color }} />
                                <div className="text-center">
                                    <p className="text-xs font-bold uppercase tracking-widest">{state.label}</p>
                                    <p className="text-[10px] font-mono text-neutral-400 mt-1">{state.color}</p>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 bg-neutral-50 text-neutral-500">{state.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImplementationSection;
