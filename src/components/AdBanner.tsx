import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
  compact?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '', compact = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In SPAs, invoke.js looks for container-2a00ac83f8be7cfb21427eddd0b63e05
    // Ensure script executes or appends cleanly
    const container = document.getElementById('container-2a00ac83f8be7cfb21427eddd0b63e05');
    if (container && container.childElementCount === 0) {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://pl31392602.profitableratecpmnetwork.com/2a00ac83f8be7cfb21427eddd0b63e05/invoke.js';
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        container.appendChild(script);
      } catch (err) {
        console.warn('Ad script injection notice:', err);
      }
    }
  }, []);

  return (
    <div
      id="monetization-ad-wrapper"
      className={`w-full bg-slate-900/90 border border-amber-500/25 rounded-xl shadow-lg flex flex-col items-center justify-center p-2.5 transition-all overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-medium px-2 mb-1.5 border-b border-slate-800 pb-1">
        <span className="flex items-center gap-1.5 text-amber-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Sponsored Advertisement</span>
        </span>
        <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 font-mono text-[9px] uppercase tracking-wider">
          ProfitRate Ad
        </span>
      </div>

      {/* The Ad Container requested by user */}
      <div
        id="container-2a00ac83f8be7cfb21427eddd0b63e05"
        ref={containerRef}
        className={`w-full flex items-center justify-center min-h-[50px] overflow-hidden text-center ${
          compact ? 'py-1' : 'py-2'
        }`}
      ></div>
    </div>
  );
};
