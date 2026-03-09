import { BrandPalette, paletteToCSS, paletteToJSON, paletteToTailwind } from '@/lib/colorUtils';
import { Download, FileJson, FileCode, Palette, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ExportSectionProps { palette: BrandPalette }

const ExportSection = ({ palette }: ExportSectionProps) => {
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPanel(label);
    setTimeout(() => setCopiedPanel(null), 1500);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const cssContent = paletteToCSS(palette);
  const jsonContent = paletteToJSON(palette);
  const tailwindContent = paletteToTailwind(palette);

  const exports = [
    { icon: FileJson, label: 'JSON', desc: 'Token definitions', action: () => downloadFile(jsonContent, 'brand-palette.json', 'application/json') },
    { icon: FileCode, label: 'CSS Variables', desc: 'Custom properties', action: () => downloadFile(cssContent, 'brand-tokens.css', 'text/css') },
    { icon: Palette, label: 'Tailwind Config', desc: 'Colors extension', action: () => downloadFile(tailwindContent, 'tailwind-colors.ts', 'text/typescript') },
    { icon: FileText, label: 'PDF Brand Book', desc: 'All 10 pages', action: () => window.print() },
  ];

  return (
    <section className="w-full bg-background section-padding">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-4xl font-extrabold text-foreground mb-4">Assets & Export</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl">Download your complete brand system in multiple formats. Ready for production implementation.</p>

        {/* Download buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
          {exports.map(exp => (
            <button key={exp.label} onClick={exp.action} className="p-8 bg-white transition-all text-left shadow-hard group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg">
              <exp.icon className="w-10 h-10 text-primary mb-6 transition-transform group-hover:scale-110" style={{ color: palette.primary[500] }} />
              <p className="text-xl font-bold text-foreground mb-1">{exp.label}</p>
              <p className="text-sm text-neutral-500 mb-6">{exp.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Download className="w-3.5 h-3.5" /> Download Asset
              </div>
            </button>
          ))}
        </div>

        {/* Code panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">System Tokens — CSS Variables</p>
              <button onClick={() => copyToClipboard(cssContent, 'css')} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary/5 px-2 py-1 transition-all">
                {copiedPanel === 'css' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPanel === 'css' ? 'Copied to Clipboard' : 'Copy Property System'}
              </button>
            </div>
            <pre className="bg-neutral-900 p-6 text-[13px] font-mono text-neutral-300 overflow-auto max-h-80 shadow-hard leading-relaxed">{cssContent}</pre>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Data Interchange — JSON Objects</p>
              <button onClick={() => copyToClipboard(jsonContent, 'json')} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:bg-primary/5 px-2 py-1 transition-all">
                {copiedPanel === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPanel === 'json' ? 'Copied to Clipboard' : 'Copy Object Data'}
              </button>
            </div>
            <pre className="bg-neutral-900 p-6 text-[13px] font-mono text-neutral-300 overflow-auto max-h-80 shadow-hard leading-relaxed">{jsonContent}</pre>
          </div>
        </div>

        <div className="pt-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8 text-center underline underline-offset-8">Execution Standards & Brand Governance</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-hard">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4" style={{ color: palette.primary[600] }}>01 / Color Protocol</p>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">Primary for interactive elements. Secondary for containers. Accent for CTAs and emphasis. Neutrals for text and structural surfaces.</p>
            </div>
            <div className="bg-white p-8 shadow-hard">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4" style={{ color: palette.primary[600] }}>02 / Typographic Scale</p>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">Use display weights for headlines only. Body text must remain regular weight at 16px minimum to ensure maximum readability.</p>
            </div>
            <div className="bg-white p-8 shadow-hard">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4" style={{ color: palette.primary[600] }}>03 / Structural Rigidity</p>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">All components must adhere to the 0px border-radius standard. Maintain 8px grid alignment. Use hard-edge shadows for depth.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExportSection;
