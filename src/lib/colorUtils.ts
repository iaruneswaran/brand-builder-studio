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
    // Smooth Bezier-like lightness curve
    if (step === 500) return baseL;
    if (step < 500) {
      const t = step / 500;
      // Slower initial climb → richer mid-light range
      return baseL + (97 - baseL) * (1 - Math.pow(t, 1.35));
    } else {
      const t = (step - 500) / 400;
      return baseL - (baseL - 8) * Math.pow(t, 1.15);
    }
  };

  const getS = (step: number) => {
    if (step === 500) return s;
    if (step < 500) {
      // Keep more saturation in lighter steps (floor raised from 30% → 50%)
      return s * (0.5 + 0.5 * (step / 500));
    }
    // Darks get a slight saturation push for richness
    return Math.min(100, s + (100 - s) * ((step - 500) / 400) * 0.18);
  };

  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  const scale: Partial<PaletteScale> = {};
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
  // Infuse 8–18% of base saturation into neutrals for hue-cohesive grays
  const tintS = Math.max(4, Math.min(18, s * 0.22));
  return {
    50:  hslToHex(h, tintS * 0.45, 99),
    100: hslToHex(h, tintS * 0.7,  96.5),
    200: hslToHex(h, tintS,        91),
    300: hslToHex(h, tintS,        80),
    400: hslToHex(h, tintS,        64),
    500: hslToHex(h, tintS,        50),
    600: hslToHex(h, tintS,        34),
    700: hslToHex(h, tintS,        21),
    800: hslToHex(h, tintS,        11),
    900: hslToHex(h, tintS,         5),
  };
}

function generateFeedback(baseH: number): FeedbackColors {
  return {
    success: hslToHex(148, 72, 40), // Deep emerald — readable on white
    warning: hslToHex(38, 96, 48),  // Warm amber — punchy, not garish
    danger:  hslToHex(2, 82, 52),   // Clean crimson
    info:    hslToHex((baseH + 190) % 360, 82, 50),
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
  const targetS = Math.min(96, baseHSL.s * satFactor);

  // Wider search range for more distinct harmony stops
  let low = 12, high = 85, bestL = 50;
  for (let i = 0; i < 10; i++) {
    const mid = (low + high) / 2;
    const lum = getLuminance(hslToHex(h, targetS, mid));
    if (Math.abs(lum - baseLum) < 0.04) { bestL = mid; break; }
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

// ─── Massively expanded color generation engine ───────────────────────────────
// 12 distinct color profiles, each with curated hue zones, saturation curves,
// and lightness bands. Golden-ratio hue stepping ensures maximum diversity.

const _goldenAngle = 137.508;
let _hueCounter = Math.random() * 360;

/** Pick a random float in [min, max] */
function _rf(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Pick a random integer in [min, max] inclusive */
function _ri(min: number, max: number) {
  return Math.floor(_rf(min, max + 1));
}

type ColorProfile = () => [number, number, number]; // [h, s, l]

const COLOR_PROFILES: ColorProfile[] = [
  // 1. Neon Burst — hyper-saturated vivid hues
  () => {
    const hueZones = [0, 30, 60, 90, 150, 180, 200, 270, 300, 330];
    const h = hueZones[_ri(0, hueZones.length - 1)] + _rf(-12, 12);
    return [(h + 360) % 360, _rf(88, 100), _rf(48, 62)];
  },

  // 2. Jewel Tones — deep, rich, gemstone colors
  () => {
    const zones = [
      [205, 230], // sapphire
      [150, 170], // emerald
      [270, 295], // amethyst
      [340, 360], // ruby
      [25,  45],  // topaz
      [185, 205], // aquamarine
    ];
    const zone = zones[_ri(0, zones.length - 1)];
    return [_rf(zone[0], zone[1]), _rf(72, 92), _rf(28, 48)];
  },

  // 3. Pastel Dream — soft, airy, high-lightness
  () => {
    const h = (_hueCounter += _goldenAngle) % 360;
    return [h, _rf(35, 65), _rf(72, 87)];
  },

  // 4. Earthy Warmth — terracotta, clay, ochre, moss
  () => {
    const zones = [
      [10, 30],   // terracotta / burnt sienna
      [30, 52],   // ochre / amber
      [52, 72],   // golden yellow
      [85, 110],  // olive / moss
      [18, 38],   // rust
    ];
    const zone = zones[_ri(0, zones.length - 1)];
    return [_rf(zone[0], zone[1]), _rf(42, 70), _rf(32, 54)];
  },

  // 5. Sunset Gradient — fiery reds, oranges, magentas
  () => {
    const h = _rf(340, 400) % 360; // 340–360 + 0–40
    const s = _rf(75, 98);
    const l = _rf(40, 60);
    return [h, s, l];
  },

  // 6. Ocean Depths — cerulean, teal, deep blue, cyan
  () => {
    const zones = [
      [175, 200], // cyan / turquoise
      [200, 225], // cerulean
      [225, 250], // cobalt
      [160, 180], // teal
      [190, 215], // sky
    ];
    const zone = zones[_ri(0, zones.length - 1)];
    return [_rf(zone[0], zone[1]), _rf(60, 95), _rf(30, 55)];
  },

  // 7. Forest & Nature — deep greens, sage, pine, lime
  () => {
    const zones = [
      [90, 120],  // lime / chartreuse
      [120, 145], // pure green
      [145, 165], // forest / pine
      [75, 95],   // yellow-green
      [130, 155], // emerald
    ];
    const zone = zones[_ri(0, zones.length - 1)];
    return [_rf(zone[0], zone[1]), _rf(50, 85), _rf(25, 50)];
  },

  // 8. Berry & Bloom — plum, violet, fuchsia, rose
  () => {
    const zones = [
      [280, 310], // violet / purple
      [310, 335], // magenta / fuchsia
      [335, 355], // rose / hot pink
      [260, 285], // indigo / periwinkle
      [295, 320], // orchid
    ];
    const zone = zones[_ri(0, zones.length - 1)];
    return [_rf(zone[0], zone[1]), _rf(65, 95), _rf(38, 62)];
  },

  // 9. Metallic Shimmer — muted gold, bronze, steel, rose gold
  () => {
    const palettes = [
      [38,  45, 52, 62],   // gold
      [20,  30, 38, 50],   // bronze
      [210, 220, 25, 40],  // steel blue
      [340, 10,  38, 55],  // rose gold
      [55,  65,  48, 60],  // champagne
    ];
    const p = palettes[_ri(0, palettes.length - 1)];
    return [_rf(p[0], p[1]), _rf(p[2], p[3]), _rf(42, 62)];
  },

  // 10. Aurora Borealis — electric green, teal, violet, cyan
  () => {
    const h = _rf(130, 320); // wide sweep through cool spectrum
    // Bias toward green-teal and violet-purple
    const zones = [130, 165, 175, 195, 255, 285, 305];
    const base = zones[_ri(0, zones.length - 1)];
    return [base + _rf(-8, 8), _rf(70, 100), _rf(45, 70)];
  },

  // 11. Cyberpunk / Synthwave — electric blue, hot pink, acid yellow, neon purple
  () => {
    const palettes: Array<[number, number, number, number, number, number]> = [
      [180, 200, 88, 100, 48, 65],  // electric cyan
      [300, 320, 85, 100, 45, 62],  // hot pink / neon magenta
      [55,  70,  88, 100, 52, 68],  // acid yellow / chartreuse
      [255, 275, 82, 98,  42, 62],  // electric violet
      [160, 178, 80, 98,  45, 65],  // neon green
      [8,   20,  88, 100, 48, 65],  // electric red / coral
    ];
    const p = palettes[_ri(0, palettes.length - 1)];
    return [_rf(p[0], p[1]), _rf(p[2], p[3]), _rf(p[4], p[5])];
  },

  // 12. Classic Brand Colors — clean, professional, timeless
  () => {
    // Inspired by iconic brand hues with slight variation
    const anchors = [
      [211, 82, 54],  // Facebook blue
      [0,   78, 55],  // Coca-Cola red
      [120, 62, 38],  // Starbucks green
      [37,  96, 50],  // Amazon amber
      [264, 80, 52],  // Instagram purple
      [195, 85, 42],  // Twitter / X cyan
      [14,  88, 52],  // YouTube red-orange
      [166, 72, 42],  // Spotify green
      [217, 76, 48],  // LinkedIn blue
      [26,  95, 52],  // Etsy orange
    ];
    const a = anchors[_ri(0, anchors.length - 1)];
    return [a[0] + _rf(-15, 15), a[1] + _rf(-12, 12), a[2] + _rf(-8, 8)] as [number, number, number];
  },
];

export function randomHex(): string {
  // 1. Pick a random profile
  const profile = COLOR_PROFILES[_ri(0, COLOR_PROFILES.length - 1)];
  // 2. Also advance golden-ratio counter for profile #3 (pastel)
  _hueCounter = (_hueCounter + _goldenAngle) % 360;
  // 3. Generate [h, s, l]
  const [h, s, l] = profile();
  // 4. Clamp to valid ranges
  const ch = ((h % 360) + 360) % 360;
  const cs = Math.max(0, Math.min(100, s));
  const cl = Math.max(0, Math.min(100, l));
  return hslToHex(ch, cs, cl);
}
