import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const tools = [
  {
    id: 'palette',
    title: 'Brand Palette',
    description: 'Generate high-end, harmonious color systems for your brand.',
    icon: '/Icons/Brand Palette.svg',
    path: '/tools/brand-palette'
  },
  {
    id: 'icons',
    title: 'Icon Browser',
    description: 'Explore and export thousands of premium vector icons.',
    icon: '/Icons/Icon Browser.svg',
    path: '/tools/icon-browser'
  },
  {
    id: 'pdf',
    title: 'Image to PDF',
    description: 'Convert multiple images into professional PDF documents.',
    icon: '/Icons/Image to PDF.svg',
    path: '/tools/image-to-pdf'
  },
  {
    id: 'heic',
    title: 'HEIC to JPG',
    description: 'Fast, high-quality conversion for modern image formats.',
    icon: '/Icons/HEIC to JPG.svg',
    path: '/tools/heic-to-jpg'
  },
  {
    id: 'qr',
    title: 'QR Generator',
    description: 'Create custom, high-resolution QR codes for any brand.',
    icon: '/Icons/QR Generator.svg',
    path: '/tools/qr-generator'
  },
  {
    id: 'html-css',
    title: 'HTML CSS Finder',
    description: 'Quickly find styles connected to specific HTML lines.',
    icon: '/Icons/Chevrons Horizontal.svg',
    path: '/tools/html-css-finder'
  }
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground md:overflow-hidden bg-grid-pattern flex flex-col">



      <main className="flex-1 flex flex-col justify-center px-6 md:px-12 py-6 md:py-8 min-h-0 overflow-y-auto md:overflow-hidden">
        <div className="max-w-7xl mx-auto w-full md:h-full flex flex-col justify-center">
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l md:h-full md:max-h-[800px] w-full" style={{ borderColor: 'hsl(262 8% 88%)', backgroundColor: 'hsl(262 20% 98.5%)' }}>
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(tool.path)}
                className="group relative p-6 lg:p-10 border-r border-b cursor-pointer overflow-hidden transition-colors flex flex-col justify-center"
                style={{ borderColor: 'hsl(262 8% 88%)', backgroundColor: 'hsl(262 20% 98.5%)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(262 30% 97%)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(262 20% 98.5%)'; }}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 border flex items-center justify-center mb-4 lg:mb-8 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: 'hsl(0 0% 100%)', borderColor: 'hsl(262 8% 91%)' }}>
                    <img 
                      src={tool.icon} 
                      alt={tool.title} 
                      className="w-5 h-5 lg:w-6 lg:h-6" 
                      style={tool.id === 'html-css' ? { transform: 'scale(1.22)' } : undefined}
                    />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold uppercase tracking-tighter mb-2 lg:mb-4 transition-colors" style={{ color: 'hsl(240 15% 6%)' }}>
                    <span className="group-hover:text-primary transition-colors">{tool.title}</span>
                  </h3>
                  <p className="text-xs lg:text-sm leading-relaxed mb-4 lg:mb-8 max-w-[240px]" style={{ color: 'hsl(250 10% 40%)' }}>
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] lg:text-xs font-black tracking-widest uppercase" style={{ color: 'hsl(250 10% 40%)' }}>
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Hover Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: 'hsl(262 84% 50% / 0.15)' }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 md:h-20 border-t px-6 md:px-12 flex items-center flex-shrink-0" style={{ borderColor: 'hsl(262 8% 88%)', backgroundColor: 'hsl(262 20% 98.5%)' }}>
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <div className="flex items-center">
            <span className="font-bold tracking-tighter text-base md:text-lg uppercase" style={{ color: 'hsl(240 15% 6%)' }}>BUILDER STUDIO</span>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;
