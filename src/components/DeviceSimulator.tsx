import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCw, 
  RefreshCw, 
  ExternalLink, 
  Wifi, 
  Battery, 
  Volume2, 
  Maximize2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface DeviceSimulatorProps {
  html: string;
  orientation: 'portrait' | 'landscape' | 'unspecified';
  appName: string;
  themeColor: string;
  appMode?: 'html' | 'url';
  webUrl?: string;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  html,
  orientation,
  appName,
  themeColor,
  appMode = 'html',
  webUrl = '',
}) => {
  const [isLandscape, setIsLandscape] = useState(orientation === 'landscape');
  const [reloadKey, setReloadKey] = useState(0);
  const [currentTime, setCurrentTime] = useState('12:00');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLandscape(orientation === 'landscape');
  }, [orientation]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    setRuntimeError(null);
    setIframeLoaded(false);
    setReloadKey(k => k + 1);
  };

  const handleOpenNewTab = () => {
    if (appMode === 'url' && webUrl) {
      window.open(webUrl, '_blank');
      return;
    }
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* Simulator Control Bar */}
      <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">Live Mobile Simulator</span>
          <span className="text-slate-400 hidden sm:inline">
            ({isLandscape ? '800 × 390' : '390 × 800'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Rotate Viewport */}
          <button
            id="rotate-device-button"
            onClick={() => setIsLandscape(!isLandscape)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Rotate phone orientation"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Reload Preview */}
          <button
            id="reload-preview-button"
            onClick={handleReload}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Reload webview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in New Window */}
          <button
            id="open-tab-preview-button"
            onClick={handleOpenNewTab}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            title="Open in new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulator Canvas / Stage */}
      <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center overflow-auto">
        
        {/* Phone Chassis */}
        <div 
          className={`relative bg-slate-900 border-[8px] border-slate-800 rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 flex flex-col overflow-hidden ring-1 ring-white/10 ${
            isLandscape 
              ? 'w-[680px] h-[340px]' 
              : 'w-[320px] sm:w-[350px] h-[640px] sm:h-[680px]'
          }`}
        >
          
          {/* Top Status Bar with Punch Hole */}
          <div className="bg-slate-950/90 backdrop-blur-md px-6 pt-2 pb-1 flex items-center justify-between text-[11px] text-slate-300 select-none z-10">
            <span className="font-semibold tracking-wider">{currentTime}</span>
            
            {/* Punch Hole Camera Cutout */}
            <div className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Webview Frame */}
          <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
            {appMode === 'url' && webUrl && (
              <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                  <span className="text-emerald-400 text-xs">🔒</span>
                  <span className="truncate font-mono text-[10px] text-slate-300">{webUrl}</span>
                </div>
                <button
                  onClick={handleReload}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="Reload webview"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex-1 relative bg-slate-950">
              {appMode === 'url' ? (
                webUrl ? (
                  <iframe
                    key={reloadKey}
                    ref={iframeRef}
                    src={webUrl}
                    title={appName || 'Preview'}
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    className="w-full h-full border-0 bg-white"
                    onLoad={() => setIframeLoaded(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">No Web Link Configured</div>
                    <div className="text-xs text-slate-500 mt-1">Enter a website URL in the Link option to preview it here.</div>
                  </div>
                )
              ) : (
                <iframe
                  key={reloadKey}
                  ref={iframeRef}
                  srcDoc={html}
                  title={appName || 'Preview'}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              )}

              {runtimeError && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-950/90 border border-red-500/50 p-2 rounded-lg text-xs text-red-200 flex items-start gap-1.5 backdrop-blur-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="truncate">{runtimeError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Android Gesture Bar */}
          <div className="bg-slate-950/90 py-1.5 flex justify-center items-center select-none">
            <div className="w-28 h-1 rounded-full bg-slate-600/60"></div>
          </div>

        </div>

      </div>

      {/* Simulator Bottom Helper Bar */}
      <div className="bg-slate-850 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Viewport: Chrome 122 / Android WebView</span>
        </div>
        <div>
          <span>Scale: 100%</span>
        </div>
      </div>

    </div>
  );
};
