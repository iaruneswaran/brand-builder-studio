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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden bg-grid-pattern flex flex-col">



      <main className="flex-1 pt-20 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-foreground/10">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(tool.path)}
                className="group relative p-10 border-r border-b border-foreground/10 cursor-pointer overflow-hidden transition-colors hover:bg-neutral-50"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#f4f4f5] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                    <img 
                      src={tool.icon} 
                      alt={tool.title} 
                      className="w-6 h-6" 
                    />
                  </div>
                  <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-[240px]">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase group-hover:translate-x-2 transition-transform">
                    Launch Tool <img src="/Icons/ArrowUpRight.svg" alt="" className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Hover Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}

            {/* Placeholder / Extra Box */}
            <div className="hidden lg:flex p-10 border-r border-b border-foreground/10 bg-primary/5 flex-col justify-between">
              <img src="/Icons/Zap.svg" alt="" className="w-8 h-8 mb-4 text-primary" />
              <div className="text-xl font-bold tracking-tighter leading-tight">
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
      <footer className="h-20 border-t border-foreground/10 px-6 md:px-12 bg-white flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <div className="flex items-center">
            <span className="font-bold tracking-tighter text-lg uppercase">Brand Development Studio</span>
          </div>
          
        </div>
      </footer>
    </div>
  );
};

export default Index;
