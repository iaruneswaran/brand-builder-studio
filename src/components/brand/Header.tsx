import { Shuffle, HelpCircle, Download, Sun, Moon, Zap } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onExport: () => void;
  onGenerate: () => void;
}

const Header = ({ darkMode, onToggleTheme, onExport, onGenerate }: HeaderProps) => (
  <header className="w-full h-[96px] bg-card border-b border-border flex items-center justify-between px-12 shadow-hard-sm sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary flex items-center justify-center">
        <Zap className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-extrabold tracking-tight text-foreground">Brand Guide Generator</span>
    </div>
    <div className="flex items-center gap-2">
      <button className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
        <HelpCircle className="w-4 h-4" /> Help
      </button>
      <button onClick={onExport} className="h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
        <Download className="w-4 h-4" /> Export
      </button>
      <button onClick={onToggleTheme} className="h-10 w-10 flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button onClick={onGenerate} className="h-10 px-6 bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
        <Shuffle className="w-4 h-4" /> Generate
      </button>
    </div>
  </header>
);

export default Header;
