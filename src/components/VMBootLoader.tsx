import React, { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';

interface VMBootLoaderProps {
  onComplete: () => void;
  hostname?: string;
}

export const VMBootLoader: React.FC<VMBootLoaderProps> = ({
  onComplete,
  hostname = 'centos9.localdomain',
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Setting up Virtual Machine...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText('Booting CentOS Stream 9 kernel...');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText(`Configuring network & terminal (${hostname})...`);
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Virtual Machine is ready!');
    }, 1300);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, hostname]);

  return (
    <div className="relative w-full h-full bg-[#1e2330] flex flex-col items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2d364f_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Content Box */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-8 text-center">
        {/* LabEx Brand Identity Logo */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-wider text-white">LabEx</span>
            <span className="text-slate-500 font-light text-xl">|</span>
            <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
              9 YEARS TRUSTED
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#12151e] h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text with Animated Dot */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
          <span>{statusText}</span>
        </div>

        {/* Skip button for quick developers */}
        <button
          onClick={onComplete}
          className="mt-6 text-[11px] text-slate-500 hover:text-slate-300 transition-colors underline cursor-pointer"
        >
          Bỏ qua hiệu ứng (Vào ngay)
        </button>
      </div>
    </div>
  );
};
