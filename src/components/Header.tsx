import React, { useState } from 'react';
import { HumanizerButton } from './HumanizerButton';
import { GeminiKeyState } from '../lib/humanizer/types';

interface HeaderProps {
  keyState: GeminiKeyState;
  isProcessing: boolean;
  onOpenModal: () => void;
  onRunHumanizer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  keyState,
  isProcessing,
  onOpenModal,
  onRunHumanizer,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#fe4c6f] rounded-lg py-1 min-w-0"
            aria-label="Prajurit Digital Beranda"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {!logoFailed ? (
                <img
                  src="https://i.ibb.co.com/wr0x733r/prajurit-digital.jpg"
                  alt="Prajurit Digital"
                  className="w-full h-full object-cover"
                  onError={() => setLogoFailed(true)}
                  loading="eager"
                />
              ) : (
                <span className="font-bold text-[#fe4c6f] text-xs">PD</span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight group-hover:text-[#fe4c6f] transition-colors truncate">
                Word Counter & Humanizer
              </span>
            </div>
          </a>

          {/* Right Action: Humanizer Button */}
          <div className="flex items-center gap-2 shrink-0">
            <HumanizerButton
              keyState={keyState}
              isProcessing={isProcessing}
              onOpenModal={onOpenModal}
              onRunHumanizer={onRunHumanizer}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
