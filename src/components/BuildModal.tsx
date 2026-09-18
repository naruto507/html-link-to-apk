import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  Key, 
  FolderArchive, 
  Terminal, 
  X, 
  RefreshCw, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { BuildResult, AppConfig } from '../types.ts';

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBuilding: boolean;
  buildResult: BuildResult | null;
  config: AppConfig;
  onRetry: () => void;
}

const BUILD_STEPS = [
  { id: 1, title: 'Validating HTML & Web Assets', desc: 'Checking markup, assets, and script syntax' },
  { id: 2, title: 'Configuring AndroidManifest & Resources', desc: 'Mapping permissions, theme colors, and icons' },
  { id: 3, title: 'Compiling Java & Dalvik Executable (DEX)', desc: 'Running javac and dx bytecode transformer' },
  { id: 4, title: 'Aligning Package Boundaries (zipalign)', desc: 'Optimizing 4-byte boundaries for Android runtime' },
  { id: 5, title: 'Signing APK (v1, v2, v3 schemes)', desc: 'Applying 2048-bit RSA cryptographic certificate' },
];

export const BuildModal: React.FC<BuildModalProps> = ({
  isOpen,
  onClose,
  isBuilding,
  buildResult,
  config,
  onRetry,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'qr' | 'publish'>('download');

  if (!isOpen) return null;

  const handleCopyDownloadUrl = () => {
    if (buildResult?.downloadUrl) {
      navigator.clipboard.writeText(buildResult.downloadUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isBuilding 
                ? 'bg-sky-500/20 text-sky-400' 
                : buildResult?.success 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isBuilding ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : buildResult?.success ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertOctagon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isBuilding 
                  ? 'Compiling Android APK...' 
                  : buildResult?.success 
                  ? 'APK Successfully Generated & Signed!' 
                  : 'APK Build Failed'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBuilding
                  ? 'Translating HTML into native Android package...'
                  : buildResult?.success
                  ? `${config.appName} • ${config.packageName} (v${config.versionName})`
                  : 'An error occurred during compilation.'}
              </p>
            </div>
          </div>

          {!isBuilding && (
            <button
              id="close-modal-button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* STATE 1: BUILDING IN PROGRESS */}
          {isBuilding && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                {BUILD_STEPS.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-200">{step.title}</div>
                      <div className="text-[11px] text-slate-400">{step.desc}</div>
                    </div>
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin mt-1" />
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-slate-400 pt-2">
                Running Dalvik exchange &amp; cryptographic signature verification...
              </div>
            </div>
          )}

          {/* STATE 2: BUILD FAILED */}
          {!isBuilding && buildResult && !buildResult.success && (
            <div className="space-y-4">
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs space-y-2">
                <div className="font-semibold text-red-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  Build Error Message:
                </div>
                <div className="font-mono bg-red-950/80 p-3 rounded-lg border border-red-500/30 overflow-x-auto text-[11px]">
                  {buildResult.error || 'Unknown error during compilation.'}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  id="retry-build-button"
                  onClick={onRetry}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Retry Compilation
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: BUILD SUCCESSFUL */}
          {!isBuilding && buildResult && buildResult.success && (
            <div className="space-y-5">
              
              {/* Build Meta Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">APK Size</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {(buildResult.apkSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signed With</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block truncate">
                    RSA-2048 Key
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Signatures</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">
                    v1 + v2 + v3 ✓
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compile Time</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {(buildResult.durationMs / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('download')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'download' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Downloads
                </button>
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'qr' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Scan &amp; Install on Mobile (QR)
                </button>
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'publish' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  APKPure &amp; Play Store Guide
                </button>
              </div>

              {/* TAB 1: DOWNLOADS */}
              {activeTab === 'download' && (
                <div className="space-y-3">
                  
                  {/* Primary Download Button */}
                  <a
                    id="download-apk-primary-button"
                    href={buildResult.downloadUrl}
                    download={buildResult.apkFilename}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                    <span>Download Ready APK ({buildResult.apkFilename})</span>
                  </a>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Keystore Download */}
                    <a
                      id="download-keystore-button"
                      href={buildResult.keystoreUrl}
                      download="release.keystore"
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-3 transition-colors text-slate-200 cursor-pointer text-xs"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Key className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">Download Keystore</div>
                        <div className="text-[11px] text-slate-400 truncate">release.keystore (Password: {config.keystore.password})</div>
                      </div>
                    </a>

                    {/* Android Studio Source Download */}
                    <a
                      id="download-project-source-button"
                      href={buildResult.projectZipUrl}
                      download="project-source.zip"
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-3 transition-colors text-slate-200 cursor-pointer text-xs"
                    >
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                        <FolderArchive className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">Android Studio Source (.ZIP)</div>
                        <div className="text-[11px] text-slate-400 truncate">Gradle + Java + Manifest + Assets</div>
                      </div>
                    </a>

                  </div>

                  {/* Sideload quick tips */}
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      How to install on your mobile device:
                    </div>
                    <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1 pl-1">
                      <li>Download the APK file onto your Android phone or tablet.</li>
                      <li>Tap the downloaded file in your notification bar or Files app.</li>
                      <li>If prompted, tap <strong>Settings</strong> and allow <em>&ldquo;Install unknown apps&rdquo;</em> from your browser.</li>
                      <li>Tap <strong>Install</strong>, and launch your brand new app!</li>
                    </ol>
                  </div>

                </div>
              )}

              {/* TAB 2: QR CODE SCAN */}
              {activeTab === 'qr' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-6">
                  {buildResult.qrDataUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-lg">
                      <img 
                        src={buildResult.qrDataUrl} 
                        alt="Download QR Code" 
                        className="w-44 h-44" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                      No QR Code
                    </div>
                  )}

                  <div className="space-y-3 flex-1 text-xs">
                    <div className="font-semibold text-white text-sm">
                      Scan with Phone Camera to Install
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Point your phone camera at this QR code to download and test the APK directly on your physical Android device without needing a USB cable.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={buildResult.downloadUrl || ''}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                      />
                      <button
                        onClick={handleCopyDownloadUrl}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
                        title="Copy direct download link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PUBLISHING GUIDE */}
              {activeTab === 'publish' && (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="font-semibold text-emerald-400 flex items-center justify-between">
                      <span>1. Publishing on APKPure (Instant &amp; Free)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Fastest</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      APKPure accepts raw signed APK files immediately with no developer registration fee:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5 pl-1">
                      <li>Go to <strong>apkpure.com/developer</strong> and sign up for free.</li>
                      <li>Click <strong>&ldquo;Add New App&rdquo;</strong> and upload this generated APK.</li>
                      <li>Fill in your app title, description, and upload screenshots.</li>
                      <li>Submit for instant distribution to millions of global Android users.</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="font-semibold text-sky-400 flex items-center justify-between">
                      <span>2. Publishing on Google Play Store</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">Official Store</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Google Play requires a Google Play Console account ($25 one-time registration):
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5 pl-1">
                      <li>Log into <strong>play.google.com/console</strong>.</li>
                      <li>Create your app and configure Store Listing &amp; Content Rating.</li>
                      <li>Upload your signed package or open the downloaded Android Studio ZIP project to build an Android App Bundle (.aab).</li>
                      <li>Keep your downloaded <code className="text-white">release.keystore</code> safe—you must use the same key for future updates!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Collapsible Build Logs */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{showLogs ? 'Hide Build Logs' : 'View Build Logs & Cryptographic Signatures'}</span>
                  {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showLogs && (
                  <div className="mt-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto space-y-1 select-text">
                    {buildResult.logs.map((log, i) => (
                      <div key={i} className="leading-5 text-slate-400">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
