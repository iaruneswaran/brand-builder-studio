import { useState, useEffect } from 'react';
import { hexToHSL, hslToHex, randomHex } from '@/lib/colorUtils';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerSectionProps {
  baseColor: string;
  onColorChange: (hex: string) => void;
}

const ColorPickerSection = ({ baseColor, onColorChange }: ColorPickerSectionProps) => {
  const hsl = hexToHSL(baseColor);
  const [localHex, setLocalHex] = useState(baseColor.toUpperCase());

  useEffect(() => {
    setLocalHex(baseColor.toUpperCase());
  }, [baseColor]);

  const handleHexInput = (val: string) => {
    setLocalHex(val.toUpperCase());
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onColorChange(val);
  };

  const handleSlider = (prop: 'h' | 's' | 'l', value: number) => {
    const newHSL = { ...hsl, [prop]: value };
    const hex = hslToHex(newHSL.h, newHSL.s, newHSL.l);
    setLocalHex(hex);
    onColorChange(hex);
  };

  const getSliderTrackStyle = (prop: string) => {
    if (prop === 'h') return 'linear-gradient(to right, #000000 0%, #FFFFFF 100%)';
    if (prop === 's') return 'linear-gradient(to right, #EEEEEE 0%, #000000 100%)';
    if (prop === 'l') return 'linear-gradient(to right, #000000 0%, #FFFFFF 100%)';
    return '';
  };

  const sliders = [
    { label: 'H', prop: 'h', max: 360, unit: '°' },
    { label: 'S', prop: 's', max: 100, unit: '%' },
    { label: 'L', prop: 'l', max: 100, unit: '%' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full bg-card z-10"
    >
      {/* ── Desktop layout (lg+): single row ── */}
      <div className="hidden lg:grid grid-cols-12 items-end w-full">
        {/* Color preview + HEX input */}
        <div className="col-span-3">
          <div className="flex items-stretch group">
            <Popover>
              <PopoverTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-14 flex-shrink-0 cursor-pointer active:opacity-80 transition-shadow duration-300 shadow-hard-sm group-hover:shadow-hard z-20"
                  style={{ backgroundColor: baseColor }}
                  title="Select Base Color"
                />
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="start"
                sideOffset={0}
                className="w-64 p-0 rounded-none shadow-hard-lg bg-background/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
              >
                <HexColorPicker
                  color={baseColor}
                  onChange={(newHex) => {
                    setLocalHex(newHex.toUpperCase());
                    onColorChange(newHex);
                  }}
                />
              </PopoverContent>
            </Popover>
            <input
              type="text"
              value={localHex}
              onChange={e => handleHexInput(e.target.value)}
              className="flex-1 h-14 px-4 bg-background border-none text-foreground text-lg font-mono font-bold focus:outline-none placeholder:opacity-20 translate-z-0"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* HSL sliders */}
        <div className="col-span-9 flex flex-col justify-center h-14 px-6 bg-neutral-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-8 h-full">
            {sliders.map((s) => (
              <div key={s.prop} className="flex-1 flex items-center gap-3 group/slider">
                <span className="text-[10px] font-bold text-neutral-900 w-4">{s.label}</span>
                <div className="relative flex-1 group">
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ background: getSliderTrackStyle(s.prop) }}
                  />
                  <Slider
                    value={[Number(hsl[s.prop as keyof typeof hsl])]}
                    max={s.max}
                    step={1}
                    onValueChange={([val]) => handleSlider(s.prop as any, val)}
                    className="relative z-10"
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-900 w-12 text-right shrink-0">
                  {Math.round(hsl[s.prop as keyof typeof hsl])}{s.unit}
                </span>
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onColorChange(randomHex())}
              className="p-2 transition-colors ml-2"
              style={{ color: '#000000' }}
              title="Randomize Color"
            >
              <Sparkles size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Mobile / Tablet layout (< lg): stacked ── */}
      <div className="lg:hidden w-full">
        {/* Row 1: color swatch + hex input + randomize */}
        <div className="flex items-stretch w-full h-12">
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-full flex-shrink-0 cursor-pointer active:opacity-80"
                style={{ backgroundColor: baseColor }}
                title="Select Base Color"
              />
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={0}
              className="w-72 p-0 rounded-none shadow-hard-lg bg-background/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
            >
              <HexColorPicker
                color={baseColor}
                onChange={(newHex) => {
                  setLocalHex(newHex.toUpperCase());
                  onColorChange(newHex);
                }}
              />
            </PopoverContent>
          </Popover>

          <input
            type="text"
            value={localHex}
            onChange={e => handleHexInput(e.target.value)}
            className="flex-1 h-full px-3 bg-background border-none text-foreground text-base font-mono font-bold focus:outline-none"
            placeholder="#3B82F6"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onColorChange(randomHex())}
            className="px-4 h-full flex items-center justify-center bg-neutral-50"
            style={{ color: '#000000' }}
            title="Randomize Color"
          >
            <Sparkles size={18} />
          </motion.button>
        </div>

        {/* Row 2: HSL sliders in 3-column grid */}
        <div className="grid grid-cols-3 gap-0 bg-neutral-50/60 px-3 py-2 border-t border-neutral-100">
          {sliders.map((s) => (
            <div key={s.prop} className="flex flex-col gap-1 px-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">{s.label}</span>
                <span className="text-[10px] font-mono font-bold text-neutral-900">
                  {Math.round(hsl[s.prop as keyof typeof hsl])}{s.unit}
                </span>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] opacity-40"
                  style={{ background: getSliderTrackStyle(s.prop) }}
                />
                <Slider
                  value={[Number(hsl[s.prop as keyof typeof hsl])]}
                  max={s.max}
                  step={1}
                  onValueChange={([val]) => handleSlider(s.prop as any, val)}
                  className="relative z-10 touch-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ColorPickerSection;
