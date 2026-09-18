import React from 'react';
import { 
  X, 
  Store, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  ExternalLink,
  HelpCircle,
  Key
} from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Mobile Publishing Guide
              </h2>
              <p className="text-xs text-slate-400">
                How to distribute your generated APK to users worldwide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          
          {/* APKPure */}
          <div className="space-y-2.5 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="font-bold text-sm text-white">Publishing on APKPure</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                Free &amp; Direct APK
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              APKPure is one of the world's most popular alternative Android app repositories with hundreds of millions of monthly active users.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong>Zero Developer Fees:</strong> No upfront or yearly fees.</li>
              <li><strong>Direct APK Acceptance:</strong> You can upload the generated <code className="text-emerald-400">.apk</code> file immediately without converting it into an AAB bundle.</li>
              <li><strong>Fast Verification:</strong> Automated scanning and publishing within hours.</li>
              <li><strong>Developer Portal:</strong> Sign up at <a href="https://apkpure.com/developer" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">apkpure.com/developer</a>.</li>
            </ul>
          </div>

          {/* Google Play Store */}
          <div className="space-y-2.5 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <h3 className="font-bold text-sm text-white">Publishing on Google Play Store</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-semibold">
                Official Android Store
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Google Play is the primary app marketplace for billions of Android devices globally.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong>Account:</strong> Create a Google Play Console account ($25 one-time registration fee).</li>
              <li><strong>Release Keystore:</strong> Download the generated <code className="text-sky-400">release.keystore</code> file. Google Play requires all subsequent updates to match your original signing key.</li>
              <li><strong>Android Studio Project Source:</strong> Google Play now strongly recommends Android App Bundles (.aab). Click &ldquo;Download Android Studio Source (.ZIP)&rdquo; to open the pre-configured project directly in Android Studio and run <em>Build &gt; Generate Signed Bundle / APK</em>.</li>
              <li><strong>Play Console:</strong> Access at <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">play.google.com/console</a>.</li>
            </ul>
          </div>

          {/* Sideloading & Other Stores */}
          <div className="space-y-2.5 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <h3 className="font-bold text-sm text-white">Other App Stores &amp; Direct Sideloading</h3>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Because our APK builder produces genuine, signed APK files with v1 (JAR), v2 (APK Signature Scheme v2), and v3 cryptographic blocks, your APK works out-of-the-box on:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">Direct Website Sideload</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Host on your own website or GitHub Releases for users to download.</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">Amazon Appstore</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Accepts standard APK files for Fire tablets and Android devices.</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">Samsung Galaxy Store</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Direct APK submission for Samsung smartphone users worldwide.</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="font-semibold text-white">F-Droid / Uptodown</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Popular open repositories that distribute signed APKs directly.</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-850 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
