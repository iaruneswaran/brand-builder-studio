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
    <section className="w-full bg-background section-rhythm">
      <div className="max-w-[1920px] mx-auto px-12">
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Assets & Export</h2>
        <p className="text-muted-foreground mb-8">Download your complete brand system in multiple formats.</p>

        {/* Download buttons */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {exports.map(exp => (
            <button key={exp.label} onClick={exp.action} className="p-6 bg-card border-2 border-border hover:border-primary transition-colors text-left shadow-hard-sm group">
              <exp.icon className="w-8 h-8 text-primary mb-4" />
              <p className="text-lg font-bold text-foreground">{exp.label}</p>
              <p className="text-sm text-muted-foreground">{exp.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
                <Download className="w-3 h-3" /> Download
              </div>
            </button>
          ))}
        </div>

        {/* Code panels */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">CSS Variables</p>
              <button onClick={() => copyToClipboard(cssContent, 'css')} className="text-xs font-bold text-primary flex items-center gap-1">
                {copiedPanel === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedPanel === 'css' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-card border border-border p-4 text-xs font-mono text-foreground overflow-auto max-h-64">{cssContent}</pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">JSON Tokens</p>
              <button onClick={() => copyToClipboard(jsonContent, 'json')} className="text-xs font-bold text-primary flex items-center gap-1">
                {copiedPanel === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedPanel === 'json' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-card border border-border p-4 text-xs font-mono text-foreground overflow-auto max-h-64">{jsonContent}</pre>
          </div>
        </div>

        {/* Brand rules */}
        <div className="border-t-2 border-border pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Brand Usage Rules</p>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6">
              <p className="font-bold text-foreground mb-2">Color Usage</p>
              <p className="text-sm text-muted-foreground">Primary for interactive elements. Secondary for containers. Accent for CTAs and emphasis. Neutrals for text and surfaces.</p>
            </div>
            <div className="bg-card border border-border p-6">
              <p className="font-bold text-foreground mb-2">Typography</p>
              <p className="text-sm text-muted-foreground">Use display weights for headlines only. Body text should remain regular weight at 16px minimum for readability.</p>
            </div>
            <div className="bg-card border border-border p-6">
              <p className="font-bold text-foreground mb-2">Components</p>
              <p className="text-sm text-muted-foreground">All components must use 0px border-radius. Maintain 8px grid alignment. Use hard-edge shadows only.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExportSection;
