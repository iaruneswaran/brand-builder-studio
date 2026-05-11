import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  }
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white text-foreground font-sans selection:bg-primary selection:text-primary-foreground md:overflow-hidden bg-grid-pattern flex flex-col">



      <main className="flex-1 flex flex-col justify-center px-6 md:px-12 py-4 md:py-8 min-h-0 overflow-y-auto md:overflow-hidden">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center">
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-foreground/10 h-full max-h-[800px] bg-white">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(tool.path)}
                className="group relative p-6 lg:p-10 border-r border-b border-foreground/10 cursor-pointer overflow-hidden transition-colors bg-white hover:bg-neutral-50 flex flex-col justify-center"
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white border border-neutral-100 flex items-center justify-center mb-4 lg:mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <img 
                      src={tool.icon} 
                      alt={tool.title} 
                      className="w-5 h-5 lg:w-6 lg:h-6" 
                    />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold uppercase tracking-tighter mb-2 lg:mb-4 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-xs lg:text-sm leading-relaxed mb-4 lg:mb-8 max-w-[240px]">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] lg:text-xs font-black tracking-widest uppercase group-hover:translate-x-2 transition-transform">
                    Launch Tool <img src="/Icons/ArrowUpRight.svg" alt="" className="w-3 h-3 lg:w-3.5 lg:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Hover Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}

            {/* Placeholder / Extra Box */}
            <div className="hidden lg:flex p-10 border-r border-b border-foreground/10 bg-white flex-col justify-center">
              <img src="/Icons/Zap.svg" alt="" className="w-8 h-8 mb-4 text-primary" />
              <div className="text-xl font-bold tracking-tighter leading-tight mb-2">
                "Design is the silent ambassador of your brand."
              </div>
              <div className="text-xs font-bold tracking-widest uppercase opacity-50">
                — Paul Rand
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 md:h-20 border-t border-foreground/10 px-6 md:px-12 bg-white flex items-center flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <div className="flex items-center">
            <span className="font-bold tracking-tighter text-base md:text-lg uppercase">Brand Development Studio</span>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;
