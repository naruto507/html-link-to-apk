import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Smartphone, 
  Shield, 
  Key, 
  Palette, 
  Check, 
  AlertCircle, 
  Upload, 
  Sparkles,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { AppConfig, ANDROID_PERMISSIONS } from '../types.ts';
import { generateIconDataUrl } from '../utils/iconGenerator.ts';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (updater: (prev: AppConfig) => AppConfig) => void;
}

const EMOJI_OPTIONS = ['⚡', '🚀', '🎮', '📱', '💡', '📊', '🔥', '💎', '🎨', '⚙️', '🌟', '🎧'];
const GRADIENT_OPTIONS = [
  { name: 'Emerald', value: '#10b981,#047857' },
  { name: 'Cyan / Ocean', value: '#0ea5e9,#0369a1' },
  { name: 'Violet / Purple', value: '#8b5cf6,#6d28d9' },
  { name: 'Sunset Rose', value: '#f43f5e,#be123c' },
  { name: 'Amber Glow', value: '#f59e0b,#b45309' },
  { name: 'Midnight Slate', value: '#334155,#0f172a' },
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'icon' | 'permissions' | 'webview' | 'signing'>('identity');
  const iconInputRef = React.useRef<HTMLInputElement>(null);

  // Auto regenerate icon whenever emoji or gradient changes if in generator mode
  useEffect(() => {
    if (config.iconType === 'generator') {
      const dataUrl = generateIconDataUrl(config.iconEmoji, config.iconBg);
      onChange(prev => ({ ...prev, iconBase64: dataUrl }));
    }
  }, [config.iconEmoji, config.iconBg, config.iconType]);

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange(prev => ({
          ...prev,
          iconType: 'upload',
          iconBase64: base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePermission = (permId: string) => {
    onChange(prev => {
      const exists = prev.permissions.includes(permId);
      const newPerms = exists 
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: newPerms };
    });
  };

  const isPackageValid = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(config.packageName);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      
      {/* Configuration Header & Tabs */}
      <div className="bg-slate-850 border-b border-slate-800 px-3 pt-2.5 pb-0 flex overflow-x-auto gap-1 scrollbar-none">
        <button
          id="tab-identity"
          onClick={() => setActiveTab('identity')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'identity'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>App Identity</span>
        </button>

        <button
          id="tab-icon"
          onClick={() => setActiveTab('icon')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'icon'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>App Icon</span>
        </button>

        <button
          id="tab-permissions"
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Permissions</span>
          <span className="ml-1 px-1.5 py-0.2 bg-slate-800 text-[10px] rounded-full text-slate-300">
            {config.permissions.length}
          </span>
        </button>

        <button
          id="tab-webview"
          onClick={() => setActiveTab('webview')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'webview'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>WebView</span>
        </button>

        <button
          id="tab-signing"
          onClick={() => setActiveTab('signing')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'signing'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Release Signing</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 overflow-y-auto flex-1 text-slate-200 space-y-4">
        
        {/* TAB 1: IDENTITY */}
        {activeTab === 'identity' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                App Display Name
              </label>
              <input
                id="input-app-name"
                type="text"
                value={config.appName}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange(prev => ({
                    ...prev,
                    appName: val,
                    packageName: prev.packageName.startsWith('com.app.') 
                      ? 'com.app.' + val.toLowerCase().replace(/[^a-z0-9]/g, '')
                      : prev.packageName
                  }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g., Neo Calculator Pro"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Name shown under the icon on the Android launcher and app drawer.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Android Package Name (Application ID)
                </label>
                {!isPackageValid && (
                  <span className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Must be dot-separated lowercase (e.g. com.company.app)
                  </span>
                )}
              </div>
              <input
                id="input-package-name"
                type="text"
                value={config.packageName}
                onChange={(e) => onChange(prev => ({ ...prev, packageName: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') }))}
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none transition-colors ${
                  isPackageValid ? 'border-slate-700 focus:border-emerald-500' : 'border-amber-500'
                }`}
                placeholder="com.example.myapp"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Unique identifier required by Google Play and APKPure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Version Name
                </label>
                <input
                  id="input-version-name"
                  type="text"
                  value={config.versionName}
                  onChange={(e) => onChange(prev => ({ ...prev, versionName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Version Code
                </label>
                <input
                  id="input-version-code"
                  type="number"
                  min="1"
                  value={config.versionCode}
                  onChange={(e) => onChange(prev => ({ ...prev, versionCode: parseInt(e.target.value, 10) || 1 }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APP ICON & THEME */}
        {activeTab === 'icon' && (
          <div className="space-y-4">
            
            {/* Live Preview of Launcher Icon */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center relative group">
                  {config.iconBase64 ? (
                    <img 
                      src={config.iconBase64} 
                      alt="App Icon" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl">📱</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Squircle</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-18 h-18 rounded-full overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center relative group">
                  {config.iconBase64 ? (
                    <img 
                      src={config.iconBase64} 
                      alt="App Icon" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-3xl">📱</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Adaptive Circle</span>
              </div>

              <div className="flex-1 text-xs text-slate-300">
                <div className="font-semibold text-white mb-0.5">{config.appName || 'My App'}</div>
                <div className="text-[11px] text-slate-400 mb-2">512×512 HD Android icon generated for mipmap-hdpi.</div>
                
                <input 
                  type="file" 
                  ref={iconInputRef} 
                  onChange={handleCustomIconUpload} 
                  accept="image/png,image/jpeg,image/webp" 
                  className="hidden" 
                />
                <button
                  id="upload-custom-icon-button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PNG/JPG</span>
                </button>
              </div>
            </div>

            {/* Icon Creator Options */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Pick Icon Glyph / Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onChange(prev => ({ ...prev, iconType: 'generator', iconEmoji: emoji }))}
                    className={`h-11 rounded-lg text-xl flex items-center justify-center transition-all cursor-pointer ${
                      config.iconType === 'generator' && config.iconEmoji === emoji
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105 shadow-md'
                        : 'bg-slate-950 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Background Palette &amp; Gradient
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_OPTIONS.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => onChange(prev => ({ ...prev, iconType: 'generator', iconBg: g.value }))}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      config.iconBg === g.value
                        ? 'border-emerald-500 bg-slate-800 shadow-md'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full shadow-inner flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${g.value})` }}
                    />
                    <span className="text-xs font-medium text-slate-200 truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                System Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="color"
                  value={config.themeColor}
                  onChange={(e) => onChange(prev => ({ ...prev, themeColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={config.themeColor}
                  onChange={(e) => onChange(prev => ({ ...prev, themeColor: e.target.value }))}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PERMISSIONS */}
        {activeTab === 'permissions' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select device capabilities for your Android app. The required permissions are added to your <code className="text-emerald-400">AndroidManifest.xml</code>.
            </p>

            <div className="space-y-2">
              {ANDROID_PERMISSIONS.map((perm) => {
                const isSelected = config.permissions.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">{perm.name}</span>
                        {perm.recommended && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{perm.desc}</p>
                      <code className="text-[10px] text-slate-500 font-mono mt-1 block">{perm.id}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: WEBVIEW SETTINGS */}
        {activeTab === 'webview' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Screen Orientation Lock
              </label>
              <select
                id="select-orientation"
                value={config.orientation}
                onChange={(e: any) => onChange(prev => ({ ...prev, orientation: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="portrait">Portrait Only (Recommended for Apps)</option>
                <option value="landscape">Landscape Only (Ideal for Games)</option>
                <option value="unspecified">Auto-Rotate (Sensor / Device Default)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label 
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">Fullscreen Immersion Mode</div>
                  <div className="text-[11px] text-slate-400">Hides system status bar and navigation soft keys (ideal for games).</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.fullscreen}
                  onChange={(e) => onChange(prev => ({ ...prev, fullscreen: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 accent-emerald-500"
                />
              </label>

              <label 
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">Hardware Acceleration</div>
                  <div className="text-[11px] text-slate-400">Enables GPU rendering for smooth 60fps animations and canvas games.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.hardwareAccelerated}
                  onChange={(e) => onChange(prev => ({ ...prev, hardwareAccelerated: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 accent-emerald-500"
                />
              </label>

              <label 
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">Pinch-to-Zoom Controls</div>
                  <div className="text-[11px] text-slate-400">Allows users to zoom in/out with multi-touch gestures.</div>
                </div>
                <input
                  type="checkbox"
                  checked={config.zoomEnabled}
                  onChange={(e) => onChange(prev => ({ ...prev, zoomEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 accent-emerald-500"
                />
              </label>

              <label 
                className="flex items-center justify-between p-3 bg-slate-950 border border-amber-500/30 bg-amber-500/5 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>Monetization CPM Ads (ProfitRate Network)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Earn Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Automatically shows entry ads and banner ads inside the APK so you earn revenue when users open the app.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.monetizationAds ?? true}
                  onChange={(e) => onChange(prev => ({ ...prev, monetizationAds: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-900 accent-amber-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: SIGNING & KEYSTORE */}
        {activeTab === 'signing' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <Key className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
              <div>
                <span className="font-semibold text-white">Cryptographic APK Signing (v1, v2 &amp; v3 schemes)</span>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  Every APK is compiled with full 2048-bit RSA keys. You can download the generated <code className="text-white">.keystore</code> file alongside the APK to retain ownership for lifetime updates on Google Play and APKPure.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Key Alias
                </label>
                <input
                  type="text"
                  value={config.keystore.alias}
                  onChange={(e) => onChange(prev => ({
                    ...prev,
                    keystore: { ...prev.keystore, alias: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  placeholder="releasekey"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keystore Password
                </label>
                <input
                  type="text"
                  value={config.keystore.password}
                  onChange={(e) => onChange(prev => ({
                    ...prev,
                    keystore: { ...prev.keystore, password: e.target.value }
                  }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  placeholder="apkbuilder2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Organization (O)
                  </label>
                  <input
                    type="text"
                    value={config.keystore.organization}
                    onChange={(e) => onChange(prev => ({
                      ...prev,
                      keystore: { ...prev.keystore, organization: e.target.value }
                    }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Mobile Dev"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country Code (C)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={config.keystore.country}
                    onChange={(e) => onChange(prev => ({
                      ...prev,
                      keystore: { ...prev.keystore, country: e.target.value.toUpperCase() }
                    }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 uppercase"
                    placeholder="US"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>APKPure Compatibility:</span>
                <span className="text-emerald-400 font-semibold">100% Ready (Direct APK)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Google Play Store:</span>
                <span className="text-emerald-400 font-semibold">Ready (Signed Release)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
