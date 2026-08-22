import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#fe4c6f] rounded-lg py-1"
            aria-label="Prajurit Digital Beranda"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {!logoFailed ? (
                <img
                  src="/prajurit-digital.jpg"
                  alt="Prajurit Digital"
                  className="w-full h-full object-cover"
                  onError={() => setLogoFailed(true)}
                  loading="eager"
                />
              ) : (
                <span className="font-bold text-[#fe4c6f] text-xs">PD</span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight group-hover:text-[#fe4c6f] transition-colors">
                Word Counter
              </span>
              <span className="text-xs text-slate-400 font-medium">
                by Prajurit Digital
              </span>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
};

