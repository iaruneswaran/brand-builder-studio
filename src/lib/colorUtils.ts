// Color utility functions for Brand Guide Generator

export interface HSL { h: number; s: number; l: number }
export interface RGB { r: number; g: number; b: number }

export interface PaletteScale {
  [key: string]: string;
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string;
}

export interface FeedbackColors {
  success: string; warning: string; danger: string; info: string;
}

export interface BrandPalette {
  name: string;
  primary: PaletteScale;
  secondary: { 300: string; 500: string; 700: string };
  accentA: { 400: string; 600: string };
  accentB: { 400: string; 600: string };
  neutrals: PaletteScale;
  feedback: FeedbackColors;
  baseHex: string;
  baseHSL: HSL;
}

export function hexToHSL(hex: string): HSL {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hslString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function generateScale(h: number, s: number): PaletteScale {
  return {
    50: hslToHex(h, Math.min(s, 30), 97),
    100: hslToHex(h, Math.min(s, 40), 93),
    200: hslToHex(h, s * 0.8, 85),
    300: hslToHex(h, s * 0.85, 72),
    400: hslToHex(h, s * 0.9, 60),
    500: hslToHex(h, s, 50),
    600: hslToHex(h, s, 42),
    700: hslToHex(h, s, 34),
    800: hslToHex(h, s * 0.95, 24),
    900: hslToHex(h, s * 0.9, 15),
  };
}

function generateNeutrals(h: number): PaletteScale {
  const ns = 8;
  return {
    50: hslToHex(h, ns, 98),
    100: hslToHex(h, ns, 95),
    200: hslToHex(h, ns, 88),
    300: hslToHex(h, ns, 75),
    400: hslToHex(h, ns, 58),
    500: hslToHex(h, ns, 45),
    600: hslToHex(h, ns, 33),
    700: hslToHex(h, ns, 24),
    800: hslToHex(h, ns, 14),
    900: hslToHex(h, ns, 8),
  };
}

function generateFeedback(baseH: number): FeedbackColors {
  return {
    success: hslToHex(120, 60, 42),
    warning: hslToHex(38, 90, 50),
    danger: hslToHex(355, 80, 50),
    info: hslToHex((baseH + 200) % 360, 65, 50),
  };
}

export function getContrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#FAFAFA';
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
      .map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function getWCAGLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function generateAnalogousPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const secH = (hsl.h + 30) % 360;
  const accAH = (hsl.h + 180) % 360;
  const accBH = (hsl.h + 210) % 360;
  return {
    name: 'Analogous',
    primary: generateScale(hsl.h, hsl.s),
    secondary: { 300: hslToHex(secH, hsl.s * 0.85, 72), 500: hslToHex(secH, hsl.s, 50), 700: hslToHex(secH, hsl.s, 34) },
    accentA: { 400: hslToHex(accAH, 75, 55), 600: hslToHex(accAH, 75, 40) },
    accentB: { 400: hslToHex(accBH, 70, 55), 600: hslToHex(accBH, 70, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateComplementaryPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const compH = (hsl.h + 180) % 360;
  const secH = (hsl.h + 30) % 360;
  return {
    name: 'Complementary',
    primary: generateScale(hsl.h, hsl.s),
    secondary: { 300: hslToHex(secH, hsl.s * 0.8, 72), 500: hslToHex(secH, hsl.s * 0.8, 50), 700: hslToHex(secH, hsl.s * 0.8, 34) },
    accentA: { 400: hslToHex(compH, 80, 55), 600: hslToHex(compH, 80, 40) },
    accentB: { 400: hslToHex((compH + 30) % 360, 65, 55), 600: hslToHex((compH + 30) % 360, 65, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateSplitComplementPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const scA = (hsl.h + 150) % 360;
  const scB = (hsl.h + 210) % 360;
  return {
    name: 'Split-Complement',
    primary: generateScale(hsl.h, hsl.s),
    secondary: { 300: hslToHex(scA, hsl.s * 0.8, 72), 500: hslToHex(scA, hsl.s * 0.8, 50), 700: hslToHex(scA, hsl.s * 0.8, 34) },
    accentA: { 400: hslToHex(scA, 75, 55), 600: hslToHex(scA, 75, 40) },
    accentB: { 400: hslToHex(scB, 75, 55), 600: hslToHex(scB, 75, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateTriadicPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const triA = (hsl.h + 120) % 360;
  const triB = (hsl.h + 240) % 360;
  return {
    name: 'Triadic',
    primary: generateScale(hsl.h, hsl.s),
    secondary: { 300: hslToHex(triA, hsl.s * 0.85, 72), 500: hslToHex(triA, hsl.s * 0.85, 50), 700: hslToHex(triA, hsl.s * 0.85, 34) },
    accentA: { 400: hslToHex(triA, 70, 55), 600: hslToHex(triA, 70, 40) },
    accentB: { 400: hslToHex(triB, 70, 55), 600: hslToHex(triB, 70, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateMonochromePalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  return {
    name: 'Monochrome',
    primary: generateScale(hsl.h, hsl.s),
    secondary: { 300: hslToHex(hsl.h, hsl.s * 0.5, 72), 500: hslToHex(hsl.h, hsl.s * 0.5, 50), 700: hslToHex(hsl.h, hsl.s * 0.5, 34) },
    accentA: { 400: hslToHex(hsl.h, hsl.s * 0.7, 60), 600: hslToHex(hsl.h, hsl.s * 0.7, 38) },
    accentB: { 400: hslToHex(hsl.h, hsl.s * 0.3, 55), 600: hslToHex(hsl.h, hsl.s * 0.3, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateCorporatePalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  return {
    name: 'Corporate Neutral',
    primary: generateScale(hsl.h, Math.min(hsl.s, 50)),
    secondary: { 300: hslToHex(hsl.h, 15, 72), 500: hslToHex(hsl.h, 15, 50), 700: hslToHex(hsl.h, 15, 34) },
    accentA: { 400: hslToHex((hsl.h + 180) % 360, 60, 50), 600: hslToHex((hsl.h + 180) % 360, 60, 38) },
    accentB: { 400: hslToHex(hsl.h, 30, 55), 600: hslToHex(hsl.h, 30, 40) },
    neutrals: generateNeutrals(hsl.h),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateAllPalettes(hex: string): BrandPalette[] {
  return [
    generateAnalogousPalette(hex),
    generateComplementaryPalette(hex),
    generateSplitComplementPalette(hex),
    generateTriadicPalette(hex),
    generateMonochromePalette(hex),
    generateCorporatePalette(hex),
  ];
}

export function paletteToCSS(palette: BrandPalette): string {
  const lines: string[] = [':root {'];
  const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  scaleKeys.forEach(k => {
    const hsl = hexToHSL(palette.primary[k]);
    lines.push(`  --color-primary-${k}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
  });
  (['300', '500', '700'] as const).forEach(k => {
    const hsl = hexToHSL(palette.secondary[k]);
    lines.push(`  --color-secondary-${k}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
  });
  const hslA4 = hexToHSL(palette.accentA['400']);
  const hslA6 = hexToHSL(palette.accentA['600']);
  lines.push(`  --color-accent-a-400: ${hslA4.h} ${hslA4.s}% ${hslA4.l}%;`);
  lines.push(`  --color-accent-a-600: ${hslA6.h} ${hslA6.s}% ${hslA6.l}%;`);
  scaleKeys.forEach(k => {
    const hsl = hexToHSL(palette.neutrals[k]);
    lines.push(`  --color-neutral-${k}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
  });
  const fb = palette.feedback;
  (['success', 'warning', 'danger', 'info'] as const).forEach(k => {
    const hsl = hexToHSL(fb[k]);
    lines.push(`  --color-${k}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
  });
  lines.push('}');
  return lines.join('\n');
}

export function paletteToJSON(palette: BrandPalette): string {
  return JSON.stringify({
    name: palette.name,
    primary: palette.primary,
    secondary: palette.secondary,
    accent: { a: palette.accentA, b: palette.accentB },
    neutrals: palette.neutrals,
    feedback: palette.feedback,
  }, null, 2);
}

export function paletteToTailwind(palette: BrandPalette): string {
  return `// tailwind.config.ts colors extension
colors: {
  primary: ${JSON.stringify(palette.primary, null, 4)},
  secondary: ${JSON.stringify(palette.secondary, null, 4)},
  accent: ${JSON.stringify({ a: palette.accentA, b: palette.accentB }, null, 4)},
  neutral: ${JSON.stringify(palette.neutrals, null, 4)},
}`;
}

export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 40);
  const l = 40 + Math.floor(Math.random() * 20);
  return hslToHex(h, s, l);
}
