import { useState, useRef, useEffect } from 'react';
import { hexToHSL, hslToHex, randomHex } from '@/lib/colorUtils';
import { Sparkles, Pipette, Settings } from 'lucide-react';
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

  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full bg-card z-10"
    >
      <div className="w-full">
        <div className="grid grid-cols-12 items-end">
          {/* Color preview + HEX input */}
          <div className="col-span-12 lg:col-span-3">
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
          <div className="col-span-12 lg:col-span-9 flex flex-col justify-center h-14 px-6 bg-neutral-50/50 backdrop-blur-sm">
            <div className="flex items-center gap-8 h-full">
              {[
                { label: 'H', prop: 'h', max: 360, unit: '°' },
                { label: 'S', prop: 's', max: 100, unit: '%' },
                { label: 'L', prop: 'l', max: 100, unit: '%' }
              ].map((s, i) => (
                <div key={s.prop} className="flex-1 flex items-center gap-3 group/slider">
                  <span className="text-[10px] font-bold text-neutral-900 w-4">{s.label}</span>
                  <div className="relative flex-1 group">
                    {/* Visual Track Background */}
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
      </div>
    </motion.section>
  );
};

export default ColorPickerSection;
