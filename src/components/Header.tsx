import React from 'react';
import { 
  Smartphone, 
  Sparkles, 
  Download, 
  Upload, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  Code,
  Globe
} from 'lucide-react';
import { AppTemplate } from '../types.ts';

interface HeaderProps {
  onGenerate: () => void;
  isBuilding: boolean;
  templates: AppTemplate[];
  onSelectTemplate: (template: AppTemplate) => void;
  onUploadHtml: (file: File) => void;
  onOpenGuide: () => void;
  appName: string;
  appMode: 'html' | 'url';
  onSwitchMode: (mode: 'html' | 'url') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGenerate,
  isBuilding,
  templates,
  onSelectTemplate,
  onUploadHtml,
  onOpenGuide,
  appName,
  appMode,
  onSwitchMode,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadHtml(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-slate-950">
            <Smartphone className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                HTML &amp; Link to APK
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                V1/V2/V3 Signed
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Build Android APKs from HTML code or any live Website Link
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
          <button
            id="header-mode-html"
            type="button"
            onClick={() => onSwitchMode('html')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              appMode === 'html'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>HTML Code</span>
          </button>

          <button
            id="header-mode-url"
            type="button"
            onClick={() => onSwitchMode('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              appMode === 'url'
                ? 'bg-sky-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Link</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-400/30 text-sky-200 font-bold uppercase tracking-wider">
              Link
            </span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Templates Dropdown */}
          <div className="relative group">
            <button 
              id="templates-button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Presets</span>
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-slate-850 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 transition-all backdrop-blur-md">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Load Starter Template
              </div>
              <div className="space-y-1">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelectTemplate(t)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-700/80 transition-colors flex flex-col gap-0.5 text-slate-200 cursor-pointer"
                  >
                    <span className="font-semibold text-emerald-300">{t.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">{t.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Upload HTML */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".html,.htm,.txt" 
            className="hidden" 
          />
          <button
            id="upload-html-button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Upload custom HTML file"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Upload HTML</span>
          </button>

          {/* Publishing Guide Button */}
          <button
            id="publishing-guide-button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Store Guide</span>
          </button>

          {/* Primary CTA: Generate APK */}
          <button
            id="generate-apk-header-button"
            onClick={onGenerate}
            disabled={isBuilding}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer ${
              isBuilding
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95'
            }`}
          >
            {isBuilding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Building APK...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Generate APK</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};
