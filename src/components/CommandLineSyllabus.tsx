import React from 'react';
import type { CourseModule, LabDefinition } from '../types/linux';
import { ModuleIcon } from './ModuleIcon';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Play,
  BookOpen,
  Sun,
  Moon,
  RotateCcw,
  FolderTree,
  HelpCircle,
  RotateCw,
  FlaskConical,
} from 'lucide-react';

interface CommandLineSyllabusProps {
  module: CourseModule;
  labs: LabDefinition[];
  completedLabIds: number[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToHome: () => void;
  onSelectLab: (lab: LabDefinition) => void;
  onContinueLearning: () => void;
  onResetProgress: () => void;
  onResetVM: () => void;
  onOpenFileBrowser: () => void;
  onOpenGuide: () => void;
}

export const CommandLineSyllabus: React.FC<CommandLineSyllabusProps> = ({
  module,
  labs,
  completedLabIds,
  theme,
  onToggleTheme,
  onBackToHome,
  onSelectLab,
  onContinueLearning,
  onResetProgress,
  onResetVM,
  onOpenFileBrowser,
  onOpenGuide,
}) => {
  const isDark = theme === 'dark';
  const totalLabs = labs.length;
  const completedCount = labs.filter((l) => completedLabIds.includes(l.id)).length;
  const progressPercent = totalLabs > 0 ? Math.round((completedCount / totalLabs) * 100) : 0;

  return (
    <div
      className={`min-h-[100dvh] transition-colors duration-200 ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f4f6fa] text-slate-800'
      }`}
    >
      {/* Top Header Bar with Breadcrumb and Actions */}
      <header
        className={`border-b transition-colors ${
          isDark
            ? 'bg-[#0d1321]/95 border-slate-800/80'
            : 'bg-white/95 border-slate-200'
        } backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breadcrumbs with clickable Linux Journey Home navigation */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <button
              onClick={onBackToHome}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors cursor-pointer mr-1 ${
                isDark
                  ? 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Quay lại trang chủ Linux Journey"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Grasshopper</span>
            </button>

            <button
              onClick={onBackToHome}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>LabEx</span>
            </button>
            <ChevronRight
              className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
            />
            <button
              onClick={onBackToHome}
              className={`transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-blue-400'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              Linux Journey
            </button>
            <ChevronRight
              className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
            />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {module.title}
            </span>
          </nav>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFileBrowser}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Duyệt tệp tin máy ảo"
            >
              <FolderTree className="w-4 h-4" />
              <span className="hidden sm:inline">Tệp tin</span>
            </button>

            <button
              onClick={onOpenGuide}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Sổ tay lệnh Linux"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Sổ tay lệnh</span>
            </button>

            <button
              onClick={onResetVM}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Đặt lại máy ảo CentOS 9"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">Đặt lại VM</span>
            </button>

            <button
              onClick={onResetProgress}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Đặt lại tiến độ bài học"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Đặt lại tiến độ</span>
            </button>

            <div className={`h-4 w-px mx-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 text-yellow-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Course Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Sticky Course Overview Card */}
          <aside className="w-full md:w-[320px] lg:w-[350px] flex-shrink-0 md:sticky md:top-24">
            <div
              className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl ${
                isDark
                  ? 'bg-[#101625] border-slate-800/80 shadow-black/40'
                  : 'bg-white border-slate-200 shadow-slate-200/50'
              }`}
            >
              {/* Top Illustration Area with Dynamic ModuleIcon */}
              <div
                className={`py-10 px-6 flex items-center justify-center relative overflow-hidden ${
                  isDark ? 'bg-[#0d1220]' : 'bg-[#eef2f9]'
                }`}
              >
                <div className="relative w-36 h-36 rounded-full bg-slate-900/40 p-2 flex items-center justify-center">
                  <ModuleIcon moduleId={module.id} size="lg" />
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6">
                <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase block">
                  LINUX JOURNEY • {module.section.toUpperCase()}
                </span>

                <h1
                  className={`text-2xl font-bold tracking-tight mt-1.5 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {module.title}
                </h1>

                <p
                  className={`text-xs sm:text-sm leading-relaxed mt-2.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {module.description}
                </p>

                {/* Subtle Divider */}
                <div className={`h-px my-5 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`} />

                {/* Lesson Count */}
                <div
                  className={`flex items-center gap-2 text-xs font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{totalLabs} bài học thực hành tương tác</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {progressPercent}% hoàn thành
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {completedCount}/{totalLabs}
                    </span>
                  </div>

                  <div
                    className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={onContinueLearning}
                  className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-150 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>TIẾP TỤC HỌC</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Syllabus Lessons List */}
          <section className="flex-1 min-w-0 w-full">
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-wider text-blue-500 uppercase block">
                GIÁO TRÌNH
              </span>
              <h2
                className={`text-2xl font-bold tracking-tight mt-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Các bài học tương tác {module.title}
              </h2>
            </div>

            {/* Lessons Stepper List */}
            <div className="space-y-3 relative">
              {labs.map((lab, index) => {
                const lessonNumber = index + 1;
                const isCompleted = completedLabIds.includes(lab.id);

                return (
                  <div
                    key={lab.id}
                    onClick={() => onSelectLab(lab)}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer active:scale-[0.995] ${
                      isDark
                        ? 'bg-[#121727]/90 hover:bg-[#161d30] border-slate-800/80 hover:border-slate-700'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Status Badge: Green Checkmark or Number Badge */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-9 h-9 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center font-semibold text-xs transition-colors ${
                            isDark
                              ? 'border-slate-700/60 bg-slate-800/50 text-slate-400 group-hover:border-slate-600 group-hover:text-slate-300'
                              : 'border-slate-200 bg-slate-100 text-slate-600 group-hover:border-slate-300 group-hover:text-slate-900'
                          }`}
                        >
                          {lessonNumber}
                        </div>
                      )}
                    </div>

                    {/* Lesson Title & Summary */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-semibold text-sm sm:text-base transition-colors ${
                            isDark
                              ? 'text-slate-100 group-hover:text-blue-400'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {lab.title}
                        </h3>
                      </div>
                      <p
                        className={`text-xs mt-1 leading-normal line-clamp-1 transition-colors ${
                          isDark
                            ? 'text-slate-400 group-hover:text-slate-300'
                            : 'text-slate-500 group-hover:text-slate-600'
                        }`}
                      >
                        {lab.summary}
                      </p>
                    </div>

                    {/* Chevron Arrow */}
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                        isDark
                          ? 'text-slate-600 group-hover:text-slate-400'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
