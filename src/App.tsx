import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { CodeEditor } from './components/CodeEditor.tsx';
import { ConfigPanel } from './components/ConfigPanel.tsx';
import { LinkToApp } from './components/LinkToApp.tsx';
import { DeviceSimulator } from './components/DeviceSimulator.tsx';
import { BuildModal } from './components/BuildModal.tsx';
import { PublishGuideModal } from './components/PublishGuideModal.tsx';
import { AppConfig, AppTemplate, BuildResult } from './types.ts';
import { generateIconDataUrl } from './utils/iconGenerator.ts';
import { 
  Sparkles, 
  Code, 
  Settings, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck,
  Layers,
  HelpCircle,
  Globe
} from 'lucide-react';

const DEFAULT_STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Neo Calc</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; height: 100vh; justify-content: flex-end; padding: 20px; overflow: hidden; }
    .display { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; padding: 20px 10px; word-break: break-all; }
    .history { font-size: 1.1rem; color: #64748b; min-height: 24px; margin-bottom: 8px; font-family: monospace; }
    .current { font-size: 3.2rem; font-weight: 700; color: #38bdf8; transition: font-size 0.2s; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 10px; }
    button {
      background: #1e293b; border: 1px solid #334155; color: #f1f5f9; font-size: 1.4rem; font-weight: 600;
      padding: 18px 0; border-radius: 18px; cursor: pointer; transition: all 0.1s;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    button:active { transform: scale(0.94); background: #334155; }
    button.op { background: #0284c7; color: white; border-color: #38bdf8; }
    button.action { background: #334155; color: #cbd5e1; }
    button.equal { background: #10b981; color: white; border-color: #34d399; grid-column: span 2; }
  </style>
</head>
<body>
  <div class="display">
    <div class="history" id="history"></div>
    <div class="current" id="display">0</div>
  </div>
  <div class="grid">
    <button class="action" onclick="clearAll()">AC</button>
    <button class="action" onclick="deleteLast()">⌫</button>
    <button class="action" onclick="inputOp('%')">%</button>
    <button class="op" onclick="inputOp('/')">÷</button>
    
    <button onclick="inputNum('7')">7</button>
    <button onclick="inputNum('8')">8</button>
    <button onclick="inputNum('9')">9</button>
    <button class="op" onclick="inputOp('*')">×</button>
    
    <button onclick="inputNum('4')">4</button>
    <button onclick="inputNum('5')">5</button>
    <button onclick="inputNum('6')">6</button>
    <button class="op" onclick="inputOp('-')">−</button>
    
    <button onclick="inputNum('1')">1</button>
    <button onclick="inputNum('2')">2</button>
    <button onclick="inputNum('3')">3</button>
    <button class="op" onclick="inputOp('+')">+</button>
    
    <button onclick="inputNum('0')">0</button>
    <button onclick="inputDot()">.</button>
    <button class="equal" onclick="calculate()">=</button>
  </div>

  <script>
    let currentInput = '0';
    let prevInput = '';
    let operation = null;
    let resetOnNext = false;

    function vibrate() {
      if (navigator.vibrate) navigator.vibrate(25);
    }

    function updateDisplay() {
      const el = document.getElementById('display');
      el.innerText = currentInput;
      if (currentInput.length > 9) el.style.fontSize = '2.2rem';
      else if (currentInput.length > 7) el.style.fontSize = '2.6rem';
      else el.style.fontSize = '3.2rem';
      document.getElementById('history').innerText = prevInput + (operation ? ' ' + operation : '');
    }

    function inputNum(num) {
      vibrate();
      if (currentInput === '0' || resetOnNext) {
        currentInput = num;
        resetOnNext = false;
      } else {
        currentInput += num;
      }
      updateDisplay();
    }

    function inputDot() {
      vibrate();
      if (resetOnNext) {
        currentInput = '0.';
        resetOnNext = false;
      } else if (!currentInput.includes('.')) {
        currentInput += '.';
      }
      updateDisplay();
    }

    function inputOp(op) {
      vibrate();
      if (operation && !resetOnNext) calculate();
      prevInput = currentInput;
      operation = op;
      resetOnNext = true;
      updateDisplay();
    }

    function calculate() {
      vibrate();
      if (!operation || resetOnNext) return;
      let result;
      const prev = parseFloat(prevInput);
      const cur = parseFloat(currentInput);
      if (isNaN(prev) || isNaN(cur)) return;

      switch(operation) {
        case '+': result = prev + cur; break;
        case '-': result = prev - cur; break;
        case '*': result = prev * cur; break;
        case '/': result = cur === 0 ? 'Error' : prev / cur; break;
        case '%': result = (prev * cur) / 100; break;
      }

      currentInput = typeof result === 'number' ? Math.round(result * 100000000) / 100000000 + '' : result;
      prevInput = '';
      operation = null;
      resetOnNext = true;
      updateDisplay();
    }

    function clearAll() {
      vibrate();
      currentInput = '0';
      prevInput = '';
      operation = null;
      resetOnNext = false;
      updateDisplay();
    }

    function deleteLast() {
      vibrate();
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = '0';
      }
      updateDisplay();
    }
  </script>
</body>
</html>`;

export default function App() {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_STARTER_HTML);
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [leftTab, setLeftTab] = useState<'editor' | 'link' | 'config'>('editor');
  
  const [config, setConfig] = useState<AppConfig>({
    appName: 'Neo Calc Pro',
    packageName: 'com.mobile.neocalc',
    versionName: '1.0.0',
    versionCode: 1,
    appMode: 'html',
    webUrl: 'https://en.m.wikipedia.org',
    orientation: 'portrait',
    fullscreen: false,
    pullToRefresh: false,
    hardwareAccelerated: true,
    zoomEnabled: false,
    permissions: ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE', 'android.permission.VIBRATE'],
    themeColor: '#0ea5e9',
    iconType: 'generator',
    iconEmoji: '⚡',
    iconBg: '#0ea5e9,#0369a1',
    iconBase64: '',
    keystore: {
      alias: 'releasekey',
      password: 'apkbuilder2026',
      organization: 'Mobile Apps Lab',
      country: 'US',
    }
  });

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Initialize initial icon
  useEffect(() => {
    const defaultIcon = generateIconDataUrl(config.iconEmoji, config.iconBg);
    setConfig(prev => ({ ...prev, iconBase64: defaultIcon }));
  }, []);

  // Fetch templates from API
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        }
      })
      .catch(err => console.warn('Could not load templates:', err));
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template: AppTemplate) => {
    setHtmlCode(template.html);
    setConfig(prev => ({
      ...prev,
      appName: template.appName,
      packageName: template.packageName,
      orientation: template.orientation,
      themeColor: template.themeColor,
      permissions: template.permissions || prev.permissions,
    }));
  };

  // Handle file upload
  const handleUploadHtml = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setHtmlCode(content);
        const namePart = file.name.replace(/\.[^/.]+$/, '');
        const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setConfig(prev => ({
          ...prev,
          appName: cleanName,
          packageName: 'com.app.' + namePart.toLowerCase().replace(/[^a-z0-9]/g, '')
        }));
      }
    };
    reader.readAsText(file);
  };

  // Single-Click Generate APK
  const handleGenerateApk = async () => {
    const isUrlMode = config.appMode === 'url';

    if (isUrlMode) {
      if (!config.webUrl?.trim()) {
        alert('Please enter a website link to package into an APK.');
        return;
      }
    } else {
      if (!htmlCode.trim()) {
        alert('Please enter HTML code before generating an APK.');
        return;
      }
    }

    setIsBuilding(true);
    setShowBuildModal(true);
    setBuildResult(null);

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          appMode: config.appMode,
          webUrl: config.webUrl,
          html: isUrlMode ? '' : htmlCode,
        }),
      });

      const data = await response.json();
      setBuildResult(data);
    } catch (err: any) {
      setBuildResult({
        success: false,
        buildId: '',
        apkSize: 0,
        apkFilename: '',
        signedWith: '',
        verifiedSchemes: { v1: false, v2: false, v3: false },
        durationMs: 0,
        logs: ['Network failure during APK compilation request.'],
        error: err?.message || 'Failed to communicate with APK compiler service.',
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* App Header */}
      <Header
        onGenerate={handleGenerateApk}
        isBuilding={isBuilding}
        templates={templates}
        onSelectTemplate={(template) => {
          handleSelectTemplate(template);
          setConfig(prev => ({ ...prev, appMode: 'html' }));
          setLeftTab('editor');
        }}
        onUploadHtml={(file) => {
          handleUploadHtml(file);
          setConfig(prev => ({ ...prev, appMode: 'html' }));
          setLeftTab('editor');
        }}
        onOpenGuide={() => setShowGuideModal(true)}
        appName={config.appName}
        appMode={config.appMode}
        onSwitchMode={(mode) => {
          setConfig(prev => ({ ...prev, appMode: mode }));
          setLeftTab(mode === 'url' ? 'link' : 'editor');
        }}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5">
        
        {/* Left Column: Editor & Configuration */}
        <section className="flex-1 flex flex-col min-w-0 h-[640px] lg:h-[calc(100vh-100px)]">
          
          {/* Workspace Tab Switcher */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl mb-3 flex items-center justify-between shadow-sm overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              <button
                id="btn-workspace-editor"
                onClick={() => {
                  setLeftTab('editor');
                  setConfig(prev => ({ ...prev, appMode: 'html' }));
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  leftTab === 'editor'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. HTML Code</span>
              </button>

              <button
                id="btn-workspace-link"
                onClick={() => {
                  setLeftTab('link');
                  setConfig(prev => ({ ...prev, appMode: 'url' }));
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  leftTab === 'link'
                    ? 'bg-sky-950 text-sky-200 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>2. Web Link to APK</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/25 text-sky-300 border border-sky-500/40">
                  URL Mode
                </span>
              </button>

              <button
                id="btn-workspace-config"
                onClick={() => setLeftTab('config')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  leftTab === 'config'
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. App &amp; Keystore</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pr-2 flex-shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium text-[11px]">
                {config.appMode === 'url' ? 'Live Website Source' : 'Offline HTML Source'}
              </span>
            </div>
          </div>

          {/* Active View: Editor, LinkToApp, or Config */}
          <div className="flex-1 min-h-0">
            {leftTab === 'editor' && (
              <CodeEditor code={htmlCode} onChange={setHtmlCode} />
            )}
            {leftTab === 'link' && (
              <LinkToApp
                config={config}
                onChange={setConfig}
                onGenerate={handleGenerateApk}
                isBuilding={isBuilding}
              />
            )}
            {leftTab === 'config' && (
              <ConfigPanel config={config} onChange={setConfig} />
            )}
          </div>

          {/* Bottom Generation Action Banner */}
          <div className="mt-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                config.appMode === 'url' 
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {config.appMode === 'url' ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate flex items-center gap-2">
                  <span>Ready to compile <strong className={config.appMode === 'url' ? 'text-sky-400' : 'text-emerald-400'}>{config.appName}</strong></span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {config.appMode === 'url' ? 'Link Mode' : 'HTML Mode'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Package: <code className="text-slate-300">{config.packageName}</code> • v{config.versionName} • 
                  {config.appMode === 'url' ? ` ${config.webUrl}` : ' Bundled HTML5 assets'}
                </div>
              </div>
            </div>

            <button
              id="generate-apk-bottom-button"
              onClick={handleGenerateApk}
              disabled={isBuilding}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer shadow-lg ${
                isBuilding
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : config.appMode === 'url'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-sky-500/25 active:scale-95'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25 active:scale-95'
              }`}
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling APK...</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-4 h-4 ${config.appMode === 'url' ? 'fill-white' : 'fill-slate-950'}`} />
                  <span>Generate APK (1-Click)</span>
                </>
              )}
            </button>
          </div>

        </section>

        {/* Right Column: Live Mobile Device Simulator */}
        <section className="w-full lg:w-[460px] xl:w-[500px] flex flex-col h-[640px] lg:h-[calc(100vh-100px)]">
          <DeviceSimulator
            html={htmlCode}
            orientation={config.orientation}
            appName={config.appName}
            themeColor={config.themeColor}
            appMode={config.appMode}
            webUrl={config.webUrl}
          />
        </section>

      </main>

      {/* Build Progress & Download Modal */}
      <BuildModal
        isOpen={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        isBuilding={isBuilding}
        buildResult={buildResult}
        config={config}
        onRetry={handleGenerateApk}
      />

      {/* Publishing Instructions Modal */}
      <PublishGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

    </div>
  );
}
