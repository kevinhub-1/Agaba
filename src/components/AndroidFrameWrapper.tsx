import React from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';

interface AndroidFrameWrapperProps {
  children: React.ReactNode;
  isSimulatorMode: boolean;
  onToggleSimulator: () => void;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({
  children,
  isSimulatorMode,
  onToggleSimulator,
}) => {
  if (!isSimulatorMode) {
    return <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950/95 py-6 px-4 flex flex-col items-center justify-center">
      {/* Top simulator toolbar */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>COMTECH Android Mobile Preview</span>
        </div>
        <button
          onClick={onToggleSimulator}
          className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
        >
          Expand Fullscreen
        </button>
      </div>

      {/* Android Device Shell (Pixel 8 / Galaxy style) */}
      <div className="relative w-full max-w-[412px] h-[860px] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-cyan-950/50 ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col overflow-hidden">
        {/* Android Punch Hole Camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-4 h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-950" />
        </div>

        {/* Android Status Bar */}
        <div className="relative z-40 h-8 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 select-none bg-slate-900 shrink-0">
          <span>09:41</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] tabular-nums">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* App Viewport Container */}
        <div className="relative flex-1 bg-slate-950 rounded-[34px] overflow-y-auto overflow-x-hidden flex flex-col border border-slate-800/80">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 flex items-center justify-center bg-slate-900 shrink-0">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
