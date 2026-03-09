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
  secondary: { 100: string; 300: string; 500: string; 700: string };
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
  return { h: h * 360, s: s * 100, l: l * 100 };
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

export function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const fix = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * fix(r) + 0.7152 * fix(g) + 0.0722 * fix(b);
}

function adjustLuminance(h: number, s: number, targetLuminance: number): string {
  let low = 0, high = 100, bestL = 50;
  for (let i = 0; i < 10; i++) {
    const mid = (low + high) / 2;
    const hex = hslToHex(h, s, mid);
    const lum = getLuminance(hex);
    if (Math.abs(lum - targetLuminance) < 0.01) {
      bestL = mid;
      break;
    }
    if (lum < targetLuminance) low = mid;
    else high = mid;
    bestL = mid;
  }
  return hslToHex(h, s, bestL);
}

function generateCurvedScale(h: number, s: number, baseL: number, originalHex?: string): PaletteScale {
  const getL = (step: number) => {
    // Custom Bezier-like curve for scales
    if (step === 500) return baseL;
    if (step < 500) {
      const t = step / 500;
      return baseL + (97 - baseL) * (1 - Math.pow(t, 1.5));
    } else {
      const t = (step - 500) / 400;
      return baseL - (baseL - 10) * Math.pow(t, 1.2);
    }
  };

  const getS = (step: number) => {
    if (step === 500) return s;
    if (step < 500) return s * (0.3 + 0.7 * (step / 500));
    return s + (100 - s) * ((step - 500) / 400) * 0.2;
  };

  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  const scale: any = {};
  steps.forEach(step => {
    if (step === 500 && originalHex) {
      scale[step] = originalHex;
    } else {
      scale[step] = hslToHex(h, getS(step), getL(step));
    }
  });
  return scale as PaletteScale;
}

function generateTintedNeutrals(h: number, s: number): PaletteScale {
  // Infuse 4-12% of base saturation into neutrals based on base saturation
  const tintS = Math.max(2, Math.min(12, s * 0.15));
  return {
    50: hslToHex(h, tintS * 0.5, 98),
    100: hslToHex(h, tintS * 0.8, 96),
    200: hslToHex(h, tintS, 90),
    300: hslToHex(h, tintS, 80),
    400: hslToHex(h, tintS, 65),
    500: hslToHex(h, tintS, 50),
    600: hslToHex(h, tintS, 35),
    700: hslToHex(h, tintS, 22),
    800: hslToHex(h, tintS, 12),
    900: hslToHex(h, tintS, 6),
  };
}

function generateFeedback(baseH: number): FeedbackColors {
  return {
    success: hslToHex(142, 70, 45), // More vibrant "best matched" emerald
    warning: hslToHex(45, 95, 50),   // Sharp golden yellow
    danger: hslToHex(0, 85, 55),     // Professional red
    info: hslToHex((baseH + 190) % 360, 80, 50),
  };
}

export function getContrastTextColor(hex: string): string {
  return getLuminance(hex) > 0.45 ? '#0F172A' : '#F8FAFC';
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1), l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function getWCAGLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

function calibrateHarmony(baseHex: string, h: number, satFactor: number = 1): { s: number, l: number } {
  const baseHSL = hexToHSL(baseHex);
  const baseLum = getLuminance(baseHex);
  const targetS = Math.min(95, baseHSL.s * satFactor);

  // Find L that matches perceived weight but stays within functional range
  let low = 20, high = 80, bestL = 50;
  for (let i = 0; i < 8; i++) {
    const mid = (low + high) / 2;
    const lum = getLuminance(hslToHex(h, targetS, mid));
    if (Math.abs(lum - baseLum) < 0.05) { bestL = mid; break; }
    if (lum < baseLum) low = mid; else high = mid;
    bestL = mid;
  }
  return { s: targetS, l: bestL };
}

export function generateAnalogousPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 30) % 360;
  const h2 = (hsl.h - 30 + 360) % 360;
  const c1 = calibrateHarmony(hex, h1, 0.9);
  const c2 = calibrateHarmony(hex, h2, 0.85);

  return {
    name: 'Analogous',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(h1, c1.s * 0.3, 94), 300: hslToHex(h1, c1.s, 72), 500: hslToHex(h1, c1.s, c1.l), 700: hslToHex(h1, c1.s, 34) },
    accentA: { 400: hslToHex(h1, c1.s, c1.l), 600: hslToHex(h1, c1.s, Math.max(20, c1.l - 15)) },
    accentB: { 400: hslToHex(h2, c2.s, c2.l), 600: hslToHex(h2, c2.s, Math.max(20, c2.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateComplementaryPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const compH = (hsl.h + 180) % 360;
  const c = calibrateHarmony(hex, compH, 1.1); // Complementary can be slightly more vibrant

  return {
    name: 'Complementary',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(compH, c.s * 0.25, 94), 300: hslToHex(compH, c.s * 0.8, 72), 500: hslToHex(compH, c.s * 0.8, 50), 700: hslToHex(compH, c.s * 0.8, 34) },
    accentA: { 400: hslToHex(compH, c.s, c.l), 600: hslToHex(compH, c.s, Math.max(20, c.l - 15)) },
    accentB: { 400: hslToHex((compH + 30) % 360, c.s * 0.9, c.l), 600: hslToHex((compH + 30) % 360, c.s * 0.9, Math.max(20, c.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateSplitComplementPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 150) % 360;
  const h2 = (hsl.h + 210) % 360;
  const c1 = calibrateHarmony(hex, h1, 1);
  const c2 = calibrateHarmony(hex, h2, 1);

  return {
    name: 'Split-Complement',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(h1, c1.s * 0.3, 94), 300: hslToHex(h1, c1.s, 72), 500: hslToHex(h1, c1.s, c1.l), 700: hslToHex(h1, c1.s, 34) },
    accentA: { 400: hslToHex(h1, c1.s, c1.l), 600: hslToHex(h1, c1.s, Math.max(20, c1.l - 15)) },
    accentB: { 400: hslToHex(h2, c2.s, c2.l), 600: hslToHex(h2, c2.s, Math.max(20, c2.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateTriadicPalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 120) % 360;
  const h2 = (hsl.h + 240) % 360;
  const c1 = calibrateHarmony(hex, h1, 0.95);
  const c2 = calibrateHarmony(hex, h2, 0.95);

  return {
    name: 'Triadic',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(h1, c1.s * 0.3, 94), 300: hslToHex(h1, c1.s, 72), 500: hslToHex(h1, c1.s, c1.l), 700: hslToHex(h1, c1.s, 34) },
    accentA: { 400: hslToHex(h1, c1.s, c1.l), 600: hslToHex(h1, c1.s, Math.max(20, c1.l - 15)) },
    accentB: { 400: hslToHex(h2, c2.s, c2.l), 600: hslToHex(h2, c2.s, Math.max(20, c2.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateMonochromePalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  return {
    name: 'Monochrome',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(hsl.h, hsl.s * 0.15, 94), 300: hslToHex(hsl.h, hsl.s * 0.4, 72), 500: hslToHex(hsl.h, hsl.s * 0.6, Math.max(20, hsl.l - 20)), 700: hslToHex(hsl.h, hsl.s * 0.8, 15) },
    accentA: { 400: hslToHex(hsl.h, Math.min(100, hsl.s * 1.2), Math.min(90, hsl.l + 10)), 600: hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 10)) },
    accentB: { 400: hslToHex(hsl.h, hsl.s * 0.2, 90), 600: hslToHex(hsl.h, hsl.s * 0.2, 20) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateCorporatePalette(hex: string): BrandPalette {
  const hsl = hexToHSL(hex);
  const coldH = (hsl.h > 180 && hsl.h < 300) ? hsl.h : 220; // Default to professional blue if not already cold
  return {
    name: 'Corporate Modern',
    primary: generateCurvedScale(hsl.h, Math.min(hsl.s, 60), Math.max(30, hsl.l), hex),
    secondary: { 100: hslToHex(coldH, 8, 94), 300: hslToHex(coldH, 20, 80), 500: hslToHex(coldH, 40, 40), 700: hslToHex(coldH, 60, 20) },
    accentA: { 400: hslToHex((hsl.h + 180) % 360, 70, 50), 600: hslToHex((hsl.h + 180) % 360, 70, 35) },
    accentB: { 400: hslToHex(hsl.h, 15, 90), 600: hslToHex(hsl.h, 15, 15) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateTetradicPalette(hex: string): BrandPalette {
  // 4 hues at 90° intervals: base, +90, +180, +270
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 90) % 360;  // Orange family
  const h2 = (hsl.h + 180) % 360; // Complementary (Red family)
  const h3 = (hsl.h + 270) % 360; // Green family
  const c1 = calibrateHarmony(hex, h1, 1.0);
  const c2 = calibrateHarmony(hex, h2, 0.95);
  const c3 = calibrateHarmony(hex, h3, 0.9);

  return {
    name: 'Tetradic',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(h1, c1.s * 0.25, 94), 300: hslToHex(h1, c1.s, 72), 500: hslToHex(h1, c1.s, c1.l), 700: hslToHex(h1, c1.s, 34) },
    accentA: { 400: hslToHex(h2, c2.s, c2.l), 600: hslToHex(h2, c2.s, Math.max(20, c2.l - 15)) },
    accentB: { 400: hslToHex(h3, c3.s, c3.l), 600: hslToHex(h3, c3.s, Math.max(20, c3.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateSquarePalette(hex: string): BrandPalette {
  // 4 hues at 60°, 180°, 240° from base — rectangle variation
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 60) % 360;  // Yellow family
  const h2 = (hsl.h + 180) % 360; // Complementary (Blue family)
  const h3 = (hsl.h + 240) % 360; // Green family
  const c1 = calibrateHarmony(hex, h1, 1.0);
  const c2 = calibrateHarmony(hex, h2, 0.95);
  const c3 = calibrateHarmony(hex, h3, 0.9);

  return {
    name: 'Square',
    primary: generateCurvedScale(hsl.h, hsl.s, hsl.l, hex),
    secondary: { 100: hslToHex(h1, c1.s * 0.25, 94), 300: hslToHex(h1, c1.s, 72), 500: hslToHex(h1, c1.s, c1.l), 700: hslToHex(h1, c1.s, 34) },
    accentA: { 400: hslToHex(h2, c2.s, c2.l), 600: hslToHex(h2, c2.s, Math.max(20, c2.l - 15)) },
    accentB: { 400: hslToHex(h3, c3.s, c3.l), 600: hslToHex(h3, c3.s, Math.max(20, c3.l - 15)) },
    neutrals: generateTintedNeutrals(hsl.h, hsl.s),
    feedback: generateFeedback(hsl.h),
    baseHex: hex, baseHSL: hsl,
  };
}

export function generateAchromaticPalette(hex: string): BrandPalette {
  // Desaturated: Black → Dark Gray → Light Gray → White
  const hsl = hexToHSL(hex);
  // Strip saturation — keep a tiny tint from base hue for warmth
  const tintH = hsl.h;
  const tintS = Math.min(6, hsl.s * 0.08);

  return {
    name: 'Achromatic',
    primary: {
      50: hslToHex(tintH, tintS, 98),
      100: hslToHex(tintH, tintS, 93),
      200: hslToHex(tintH, tintS, 82),
      300: hslToHex(tintH, tintS, 68),
      400: hslToHex(tintH, tintS, 52),
      500: hslToHex(tintH, tintS, 38),
      600: hslToHex(tintH, tintS, 26),
      700: hslToHex(tintH, tintS, 16),
      800: hslToHex(tintH, tintS, 8),
      900: hslToHex(tintH, tintS, 3),
    },
    secondary: {
      100: hslToHex(tintH, tintS, 96),
      300: hslToHex(tintH, tintS, 75),
      500: hslToHex(tintH, tintS, 45),
      700: hslToHex(tintH, tintS, 14),
    },
    accentA: { 400: hslToHex(tintH, tintS, 60), 600: hslToHex(tintH, tintS, 30) },
    accentB: { 400: hslToHex(tintH, tintS, 88), 600: hslToHex(tintH, tintS, 10) },
    neutrals: generateTintedNeutrals(tintH, tintS),
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
    generateTetradicPalette(hex),
    generateSquarePalette(hex),
    generateMonochromePalette(hex),
    generateCorporatePalette(hex),
    generateAchromaticPalette(hex),
  ];
}

export function paletteToCSS(palette: BrandPalette): string {
  const lines: string[] = [':root {'];
  const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  scaleKeys.forEach(k => {
    const hsl = hexToHSL(palette.primary[k]);
    lines.push(`  --color-primary-${k}: ${hsl.h} ${hsl.s}% ${hsl.l}%;`);
  });
  (['100', '300', '500', '700'] as const).forEach(k => {
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
