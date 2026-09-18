import React, { useState } from 'react';
import { AppConfig, UrlInspectionResult } from '../types.ts';
import { 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Palette, 
  Image as ImageIcon,
  ArrowRight,
  Sliders,
  Wifi,
  Copy,
  Check
} from 'lucide-react';

interface LinkToAppProps {
  config: AppConfig;
  onChange: React.Dispatch<React.SetStateAction<AppConfig>>;
  onGenerate: () => void;
  isBuilding: boolean;
}

const POPULAR_SAMPLES = [
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', pkg: 'com.wikipedia.app', color: '#3366cc' },
  { name: 'DevDocs API', url: 'https://devdocs.io', pkg: 'com.devdocs.app', color: '#2563eb' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', pkg: 'com.hackernews.app', color: '#ff6600' },
  { name: 'Google News', url: 'https://news.google.com', pkg: 'com.googlenews.app', color: '#1a73e8' },
];

export const LinkToApp: React.FC<LinkToAppProps> = ({
  config,
  onChange,
  onGenerate,
  isBuilding,
}) => {
  const [urlInput, setUrlInput] = useState(config.webUrl || 'https://en.m.wikipedia.org');
  const [isChecking, setIsChecking] = useState(false);
  const [inspection, setInspection] = useState<UrlInspectionResult | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Run URL inspection against backend
  const handleCheckUrl = async (urlToCheck?: string) => {
    const target = (urlToCheck || urlInput).trim();
    if (!target) {
      setCheckError('Please enter a website link (e.g. https://yourwebsite.com)');
      return;
    }

    setIsChecking(true);
    setCheckError(null);

    try {
      const res = await fetch('/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });
      const data: UrlInspectionResult = await res.json();

      if (!data.success && data.error) {
        setCheckError(data.error);
        setInspection(data);
      } else {
        setInspection(data);
        setUrlInput(data.url);
        
        // Auto-update config with detected site attributes
        onChange(prev => {
          const next = { ...prev };
          next.webUrl = data.url;
          if (data.suggestedAppName && (!prev.appName || prev.appName === 'Neo Calc Pro' || prev.appName === 'My Web App')) {
            next.appName = data.suggestedAppName;
          }
          if (data.suggestedPackageName) {
            next.packageName = data.suggestedPackageName;
          }
          if (data.themeColor && data.themeColor !== '#0ea5e9') {
            next.themeColor = data.themeColor;
          }
          if (data.faviconBase64) {
            next.iconType = 'upload';
            next.iconBase64 = data.faviconBase64;
          }
          return next;
        });
      }
    } catch (err: any) {
      setCheckError(err?.message || 'Network error while checking website link.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplySample = (sample: typeof POPULAR_SAMPLES[0]) => {
    setUrlInput(sample.url);
    onChange(prev => ({
      ...prev,
      webUrl: sample.url,
      appName: sample.name,
      packageName: sample.pkg,
      themeColor: sample.color,
    }));
    handleCheckUrl(sample.url);
  };

  const handleApplyTitle = () => {
    if (inspection?.suggestedAppName) {
      onChange(prev => ({ ...prev, appName: inspection.suggestedAppName }));
    }
  };

  const handleApplyFavicon = () => {
    if (inspection?.faviconBase64) {
      onChange(prev => ({
        ...prev,
        iconType: 'upload',
        iconBase64: inspection.faviconBase64!,
      }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/40 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">Website / Link to APK Builder</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Live URL Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter any website or web app link — our compiler verifies the link and packages it into a native APK.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        
        {/* Link Input Card */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3 shadow-inner">
          <label className="block text-xs font-semibold text-slate-200">
            Target Website or Web App URL:
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4 text-sky-400" />
              </div>
              <input
                id="target-url-input"
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  onChange(prev => ({ ...prev, webUrl: e.target.value }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCheckUrl();
                  }
                }}
                placeholder="https://yourwebsite.com or my-app.com"
                className="w-full pl-9 pr-24 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-all"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setUrlInput(text);
                      onChange(prev => ({ ...prev, webUrl: text }));
                    }
                  } catch {}
                }}
                className="absolute right-2 top-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
                title="Paste from clipboard"
              >
                Paste
              </button>
            </div>

            <button
              id="check-url-button"
              onClick={() => handleCheckUrl()}
              disabled={isChecking}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer flex-shrink-0"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Link...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check &amp; Inspect Link</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Quick Test Links */}
          <div className="pt-1 flex items-center flex-wrap gap-1.5 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 mr-1">Try instant samples:</span>
            {POPULAR_SAMPLES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleApplySample(s)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer border border-slate-700/60"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Status Card */}
        {isChecking && (
          <div className="bg-slate-950/80 border border-sky-500/30 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin flex-shrink-0" />
            <div className="text-xs text-slate-300">
              <div className="font-semibold text-sky-300">Connecting to website and inspecting server headers...</div>
              <div className="text-slate-400 mt-0.5">Validating SSL certificate, response latency, favicon, and mobile meta tags.</div>
            </div>
          </div>
        )}

        {checkError && !isChecking && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-200">
              <div className="font-bold text-red-300">Website Verification Alert</div>
              <div className="mt-1 leading-relaxed">{checkError}</div>
              <div className="mt-2 text-[11px] text-red-300/80">
                Tip: Ensure the URL includes <code className="bg-red-900/40 px-1 py-0.5 rounded">https://</code> and the server is publicly accessible.
              </div>
            </div>
          </div>
        )}

        {inspection && inspection.success && !isChecking && (
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-4 space-y-4 shadow-sm">
            
            {/* Header / Verified Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400">Website Online &amp; Verified</span>
                  <span className="text-slate-400 text-xs ml-2">Status: {inspection.statusCode} {inspection.statusText}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{inspection.responseTimeMs}ms response</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
                  {inspection.isHttps ? 'HTTPS Secure' : 'HTTP'}
                </span>
              </div>
            </div>

            {/* Extracted Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* App Title Detection */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Detected Title</div>
                  <div className="font-semibold text-white truncate mt-0.5" title={inspection.title}>
                    {inspection.title || 'Untitled'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    Suggested: <span className="text-sky-300 font-medium">{inspection.suggestedAppName}</span>
                  </div>
                </div>
                {config.appName !== inspection.suggestedAppName && (
                  <button
                    type="button"
                    onClick={handleApplyTitle}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-[11px] transition-colors cursor-pointer border border-slate-700 flex-shrink-0"
                  >
                    Use as Name
                  </button>
                )}
              </div>

              {/* Package Name Suggestion */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Package ID</div>
                <div className="font-mono text-emerald-300 font-semibold truncate mt-0.5">
                  {inspection.suggestedPackageName}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Android Store ID configured
                </div>
              </div>

              {/* Favicon / Icon Detection */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {inspection.faviconBase64 ? (
                    <img
                      src={inspection.faviconBase64}
                      alt="Favicon"
                      className="w-8 h-8 rounded-lg bg-slate-800 p-1 object-contain border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 flex-shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Website Favicon</div>
                    <div className="text-xs text-white truncate">
                      {inspection.faviconBase64 ? 'Extracted successfully' : 'Default launcher icon'}
                    </div>
                  </div>
                </div>

                {inspection.faviconBase64 && config.iconBase64 !== inspection.faviconBase64 && (
                  <button
                    type="button"
                    onClick={handleApplyFavicon}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white text-[11px] transition-colors cursor-pointer border border-slate-700 flex-shrink-0"
                  >
                    Use as App Icon
                  </button>
                )}
              </div>

              {/* Theme Color */}
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg border border-white/20 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: inspection.themeColor || '#0ea5e9' }}
                  />
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Theme Color</div>
                    <div className="font-mono text-white text-xs font-semibold">
                      {inspection.themeColor || '#0ea5e9'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Iframe notice if site has X-Frame-Options */}
            {!inspection.allowsIframe && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-amber-300">X-Frame-Options Protection Notice:</span> This website sends headers that prevent standard desktop browser iframes from embedding it. While our web simulator may show a preview card, your <strong>compiled Android APK runs in native WebView mode</strong> where this website loads 100% unrestricted and without issue!
                </div>
              </div>
            )}

          </div>
        )}

        {/* Link App Native Capabilities */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800/80 pb-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Link-to-App Native Features (Included in APK)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Feature 1: Domain Internal Navigation */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Smart In-App Navigation</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Links on your domain stay inside the app. External links and WhatsApp/Phone/Mail open in native apps.
                </div>
              </div>
            </div>

            {/* Feature 2: Offline Resilience */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <Wifi className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Offline Recovery Screen</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  If the phone loses internet, a native offline retry card displays with a 1-tap reload button.
                </div>
              </div>
            </div>

            {/* Feature 3: Hardware Acceleration */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Hardware-Accelerated WebView</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  GPU-rendered smooth scrolling, CSS3 animations, and full HTML5 LocalStorage &amp; cookies.
                </div>
              </div>
            </div>

            {/* Feature 4: Android Hardware Back Button */}
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Hardware Back Button History</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Pressing the Android back button navigates previous web pages instead of abruptly exiting the app.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
