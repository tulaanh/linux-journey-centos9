import React from 'react';
import type { CourseModule, LabDefinition } from '../types/linux';
import { ModuleIcon } from './ModuleIcon';
import { FlaskConical } from 'lucide-react';

interface LinuxJourneyHomeProps {
  modules: CourseModule[];
  completedLabIds: number[];
  theme: 'dark' | 'light';
  onToggleTheme?: () => void;
  onSelectModule: (module: CourseModule) => void;
  onNavigateChallenges?: () => void;
  onSelectLabDirectly?: (module: CourseModule, lab: LabDefinition) => void;
  onOpenFileBrowser: () => void;
  onOpenGuide: () => void;
  onResetVM?: () => void;
}

export const LinuxJourneyHome: React.FC<LinuxJourneyHomeProps> = ({
  modules,
  completedLabIds,
  theme,
  onSelectModule,
  onNavigateChallenges,
  onOpenFileBrowser,
  onOpenGuide,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-[100dvh] flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#111827] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`h-14 px-4 sm:px-8 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-[#0d1321] text-slate-200'
            : 'bg-white text-slate-800 border-b border-slate-200'
        }`}
      >
        <div className="max-w-[1160px] w-full mx-auto flex items-center justify-between">
          {/* Left: Logo & Primary Navigation */}
          <div className="flex items-center gap-7">
            {/* LabEx Brand Logo */}
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 font-bold text-lg tracking-tight cursor-pointer focus:outline-none group"
            >
              <FlaskConical
                className={`w-5 h-5 transition-transform duration-200 group-hover:rotate-[-8deg] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                strokeWidth={2.2}
              />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>LabEx</span>
            </button>

            {/* Primary Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium">
              <button
                onClick={() => onSelectModule(modules[1] || modules[0])}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Learn
              </button>
              <button
                onClick={onNavigateChallenges}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Challenges
              </button>
              <button
                onClick={onOpenGuide}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={onOpenFileBrowser}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => {}}
                className="text-[#3b82f6] font-semibold cursor-pointer"
              >
                Linux Journey
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Secondary Sub-bar strip matching the screenshot */}
      <div
        className={`h-6 w-full border-y transition-colors ${
          isDark
            ? 'bg-[#182232] border-[#222f46]'
            : 'bg-slate-200/70 border-slate-300/60'
        }`}
      />

      {/* Main Content Area: Grasshopper Section */}
      <main className="flex-1 w-full max-w-[1060px] mx-auto px-4 sm:px-8 pt-11 pb-20">
        {/* Section Heading */}
        <h1
          className={`text-center text-2xl sm:text-[26px] font-bold tracking-tight mb-9 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Grasshopper
        </h1>

        {/* 4x2 Grid of Grasshopper Cards matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((module) => {
            const totalLabsInModule = module.labs.length;
            const completedInModule = module.labs.filter((l) =>
              completedLabIds.includes(l.id)
            ).length;

            return (
              <div
                key={module.id}
                onClick={() => onSelectModule(module)}
                className={`group relative rounded-md px-5 pt-7 pb-6 flex flex-col items-center text-center cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                  isDark
                    ? 'bg-[#1b2234] hover:bg-[#212a40] border border-white/[0.04] hover:border-slate-700/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.45)]'
                    : 'bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Circular Flat Illustration */}
                <div className="mb-5 transition-transform duration-300 group-hover:scale-105">
                  <ModuleIcon moduleId={module.id} size="md" />
                </div>

                {/* Module Title */}
                <h2
                  className={`text-[15px] font-bold tracking-tight transition-colors ${
                    isDark
                      ? 'text-white group-hover:text-blue-400'
                      : 'text-slate-900 group-hover:text-blue-600'
                  }`}
                >
                  {module.title}
                </h2>

                {/* Module Description */}
                <p
                  className={`text-[12px] leading-[1.6] mt-2.5 max-w-[215px] ${
                    isDark ? 'text-[#94a3b8]' : 'text-slate-600'
                  }`}
                >
                  {module.description}
                </p>

                {/* Subtle Progress Indicator on Hover */}
                <div className="mt-auto pt-4 w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      completedInModule > 0
                        ? isDark
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                        : isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {completedInModule}/{totalLabsInModule} lessons
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
