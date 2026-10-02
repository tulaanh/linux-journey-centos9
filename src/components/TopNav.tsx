import React from 'react';
import { CentOSKernel } from '../services/centosKernel';
import {
  FolderTree,
  RotateCcw,
  Sun,
  Moon,
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TopNavProps {
  kernel: CentOSKernel;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenFileBrowser: () => void;
  onResetVM: () => void;
  onOpenGuide: () => void;
  completedCount: number;
  totalLabs: number;
  onToggleUser: () => void;
  onBackToSyllabus?: () => void;
  currentLabTitle?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  kernel,
  theme,
  onToggleTheme,
  onOpenFileBrowser,
  onResetVM,
  onOpenGuide,
  completedCount,
  totalLabs,
  onToggleUser,
  onBackToSyllabus,
  currentLabTitle,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`h-11 border-b flex items-center justify-between px-3 text-xs select-none transition-colors ${
        isDark
          ? 'bg-[#0d1117] border-[#30363d] text-slate-200'
          : 'bg-white border-[#d0d7de] text-slate-800 shadow-xs'
      }`}
    >
      {/* Left Area: Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {onBackToSyllabus && (
          <button
            onClick={onBackToSyllabus}
            className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' 
                : 'bg-slate-100 hover:bg-slate-200 text-blue-600'
            }`}
            title="Quay lại danh sách bài học"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Syllabus</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs truncate">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Command Line</span>
          <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <span className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {currentLabTitle || 'Interactive Terminal'}
          </span>
        </div>
      </div>

      {/* Center: Clean Progress Pill */}
      <div
        className={`hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[11px] font-mono ${
          isDark
            ? 'bg-[#161b22] border-[#30363d] text-slate-300'
            : 'bg-[#f6f8fa] border-[#d0d7de] text-slate-700'
        }`}
      >
        <span className="text-[10px] text-slate-400 uppercase font-sans">Progress:</span>
        <span className="font-bold text-emerald-500">
          {completedCount}/{totalLabs}
        </span>
        <div
          className={`w-12 h-1 rounded-full overflow-hidden ${
            isDark ? 'bg-slate-800' : 'bg-slate-200'
          }`}
        >
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(completedCount / totalLabs) * 100}%` }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* User toggle */}
        <button
          onClick={onToggleUser}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition text-xs font-mono cursor-pointer ${
            isDark
              ? 'bg-[#161b22] border-[#30363d] hover:bg-slate-800'
              : 'bg-[#f6f8fa] border-[#d0d7de] hover:bg-slate-100'
          }`}
          title="Chuyển user giữa root và centos"
        >
          <User className="w-3 h-3 text-blue-500" />
          <span className={kernel.currentUser === 'root' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
            {kernel.currentUser}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded transition cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
              : 'text-slate-600 hover:text-amber-500 hover:bg-slate-100'
          }`}
          title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* File Browser */}
        <button
          onClick={onOpenFileBrowser}
          className={`p-1.5 rounded transition cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Duyệt File"
        >
          <FolderTree className="w-3.5 h-3.5" />
        </button>

        {/* Help */}
        <button
          onClick={onOpenGuide}
          className={`p-1.5 rounded transition cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Cheatsheet & Lệnh thường dùng"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Reset VM */}
        <button
          onClick={onResetVM}
          className={`p-1.5 rounded transition cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
          }`}
          title="Reset máy ảo CentOS 9"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
