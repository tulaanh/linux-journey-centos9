import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CentOSKernel } from '../services/centosKernel';
import type { LabDefinition, LabCheckResult, CourseModule } from '../types/linux';
import type { LessonDocument } from '../types/lessonDoc';
import type { ChallengeDefinition } from '../services/challengesData';
import { TerminalView } from './TerminalView';
import { LabExStepGuide } from './LabExStepGuide';
import { ChallengeGuidePanel } from './ChallengeGuidePanel';
import { VMBootLoader } from './VMBootLoader';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sun,
  Moon,
  FolderTree,
  User,
  FlaskConical,
  HelpCircle,
} from 'lucide-react';

interface LabWorkspaceProps {
  kernel: CentOSKernel;
  currentLab: LabDefinition;
  lessonDoc?: LessonDocument;
  currentChallenge?: ChallengeDefinition;
  currentModule: CourseModule;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToHome: () => void;
  onBackToSyllabus: () => void;
  onBackToChallenges?: () => void;
  onResetVM: () => void;
  onOpenFileBrowser: () => void;
  onOpenGuide: () => void;
  onToggleUser: () => void;
  refreshKernel: () => void;
  completedLabIds: number[];
  onCompleteLab: (labId: number) => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({
  kernel,
  currentLab,
  lessonDoc,
  currentChallenge,
  currentModule,
  theme,
  onToggleTheme,
  onBackToHome,
  onBackToSyllabus,
  onBackToChallenges,
  onResetVM,
  onOpenFileBrowser,
  onOpenGuide,
  onToggleUser,
  refreshKernel,
  completedLabIds,
  onCompleteLab,
}) => {
  const isDark = theme === 'dark';

  // VM Boot state: simulates cloud VM loading
  const [isBooting, setIsBooting] = useState<boolean>(true);

  // Split-pane width state (Right guide card width)
  const [guideWidth, setGuideWidth] = useState<number>(440);
  const isDragging = useRef<boolean>(false);

  // Command sent from Guide to Terminal
  const [pendingCommand, setPendingCommand] = useState<{ id: number; command: string } | null>(null);

  // Toggle guide visibility (collapse/expand to give full screen to VM)
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(true);

  // Toggle between 8-step interactive guide and Challenge verification panel when both exist
  const [rightPanelTab, setRightPanelTab] = useState<'steps' | 'challenge'>('steps');

  // Trigger VM boot loader when lab changes
  useEffect(() => {
    setIsBooting(true);
    setRightPanelTab('steps');
  }, [currentLab.id]);

  // Handle running command from right panel directly into terminal on the left
  const handleRunCommand = useCallback((cmd: string) => {
    setPendingCommand({ id: Date.now() + Math.random(), command: cmd });
  }, []);

  // Handle Lab Check & Evaluation
  const handleCheckLab = useCallback((): LabCheckResult[] => {
    const results = currentLab.evaluate(kernel);
    const totalEarned = results.reduce((a, b) => a + b.pointsEarned, 0);
    const totalMax = results.reduce((a, b) => a + b.maxPoints, 0);
    if (totalEarned === totalMax && totalMax > 0) {
      onCompleteLab(currentLab.id);
    }
    return results;
  }, [currentLab, kernel, onCompleteLab]);

  // Handle Reset Lab State
  const handleResetLab = useCallback(() => {
    currentLab.setupState(kernel);
    refreshKernel();
  }, [currentLab, kernel, refreshKernel]);

  // Draggable Split Divider Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const containerWidth = window.innerWidth;
      // guideWidth is measured from the right edge
      const newWidth = Math.max(320, Math.min(containerWidth - 400, containerWidth - moveEvent.clientX));
      setGuideWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none transition-colors ${
        isDark ? 'bg-[#0a0d14] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* 1. TOP NAVIGATION BAR */}
      <header
        className={`h-11 border-b flex items-center justify-between px-3 text-xs z-30 transition-colors ${
          isDark
            ? 'bg-[#0f131d] border-[#222a3d] text-slate-200'
            : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        {/* Left: Breadcrumbs & Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {currentChallenge ? (
            <>
              <button
                onClick={onBackToChallenges || onBackToHome}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                }`}
                title="Quay lại danh sách thử thách"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Challenges</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs truncate">
                <button
                  onClick={onBackToChallenges || onBackToHome}
                  className={`hidden md:inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
                  }`}
                >
                  <FlaskConical className="w-3 h-3 text-rose-400" />
                  <span>Challenges</span>
                </button>

                <ChevronRight className="hidden md:inline w-3 h-3 text-slate-600" />

                <span className="text-slate-400 hidden sm:inline">{currentChallenge.category}</span>

                <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-600" />

                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {currentChallenge.title}
                </span>

                {completedLabIds.includes(currentChallenge.id) && (
                  <span className="text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 hidden md:inline">
                    ✓ Đã vượt qua
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onBackToSyllabus}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#182030] hover:bg-[#202b40] text-sky-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-blue-600'
                }`}
                title="Quay lại danh sách bài học"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Syllabus</span>
              </button>

              {/* Breadcrumb Path */}
              <div className="flex items-center gap-1.5 text-xs truncate">
                <button
                  onClick={onBackToHome}
                  className={`hidden md:inline-flex items-center gap-1 transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  <FlaskConical className="w-3 h-3 text-sky-400" />
                  <span>Linux Journey</span>
                </button>

                <ChevronRight className="hidden md:inline w-3 h-3 text-slate-600" />

                <span className="text-slate-400 hidden sm:inline">{currentModule.title}</span>

                <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-600" />

                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {currentLab.title}
                </span>
                {completedLabIds.includes(currentLab.id) && (
                  <span className="text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 hidden md:inline">
                    ✓ Hoàn thành
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: VM Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* VM Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>centos9.localdomain</span>
          </div>

          {/* User Toggle: root / pete */}
          <button
            onClick={onToggleUser}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[11px] transition-colors cursor-pointer ${
              kernel.currentUser === 'root'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
            }`}
            title={`Người dùng hiện tại: ${kernel.currentUser} (Nhấp để chuyển đổi)`}
          >
            <User className="w-3 h-3" />
            <span>{kernel.currentUser}</span>
          </button>

          {/* File Browser Modal Trigger */}
          <button
            onClick={onOpenFileBrowser}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Duyệt tệp tin ảo VFS"
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>

          {/* Reset VM */}
          <button
            onClick={() => {
              onResetVM();
              setIsBooting(true);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Khởi động lại máy ảo (Reboot VM)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* User Guide Modal */}
          <button
            onClick={onOpenGuide}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-yellow-400'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          {/* Guide Panel Toggle */}
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              isGuideOpen
                ? isDark
                  ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                  : 'border-blue-300 bg-blue-50 text-blue-700'
                : isDark
                ? 'border-slate-800 text-slate-400 hover:text-white'
                : 'border-slate-200 text-slate-600'
            }`}
            title="Ẩn/Hiện bảng nhiệm vụ & hướng dẫn"
          >
            <span>{isGuideOpen ? 'Thu gọn Panel' : 'Mở Hướng dẫn'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: SPLIT VIEW (LEFT: VM, RIGHT: GUIDE) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: MÁY ẢO LINUX / TERMINAL (~65% - 70%) */}
        <section className="flex-1 h-full min-w-0 overflow-hidden relative flex flex-col bg-[#0b0e17]">
          {isBooting ? (
            <VMBootLoader
              onComplete={() => setIsBooting(false)}
              hostname={kernel.hostname}
            />
          ) : (
            <div className="flex-1 h-full w-full overflow-hidden">
              <TerminalView
                kernel={kernel}
                theme={theme}
                onKernelUpdate={refreshKernel}
                pendingCommand={pendingCommand}
              />
            </div>
          )}
        </section>

        {/* RESIZABLE DIVIDER */}
        {isGuideOpen && (
          <div
            onMouseDown={handleMouseDown}
            className="w-1.5 h-full cursor-col-resize hover:bg-sky-500 bg-[#1e2535] transition-colors z-20 flex-shrink-0"
            title="Kéo sang trái/phải để thay đổi tỷ lệ hiển thị"
          />
        )}

        {/* RIGHT PANE: NHIỆM VỤ & HƯỚNG DẪN HOẶC THỬ THÁCH (~30% - 35%) */}
        {isGuideOpen && (
          <section
            style={{ width: `${guideWidth}px` }}
            className="h-full flex-shrink-0 p-3 bg-[#0d1017] border-l border-[#202738] overflow-hidden flex flex-col z-10"
          >
            {currentChallenge && lessonDoc && (
              <div className="mb-2.5 p-1 rounded-xl bg-[#131824] border border-[#252d40] grid grid-cols-2 gap-1 flex-shrink-0">
                <button
                  onClick={() => setRightPanelTab('steps')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    rightPanelTab === 'steps'
                      ? 'bg-[#1677ff] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2130]'
                  }`}
                >
                  <span>📖 8 Phần Thực Hành</span>
                </button>
                <button
                  onClick={() => setRightPanelTab('challenge')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    rightPanelTab === 'challenge'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2130]'
                  }`}
                >
                  <span>🔥 Chấm Điểm Challenge</span>
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {currentChallenge && (!lessonDoc || rightPanelTab === 'challenge') ? (
                <ChallengeGuidePanel
                  challenge={currentChallenge}
                  theme={theme}
                  onCheckChallenge={handleCheckLab}
                  onResetChallenge={handleResetLab}
                  onClosePanel={() => setIsGuideOpen(false)}
                />
              ) : (
                <LabExStepGuide
                  lessonDoc={lessonDoc}
                  labDef={currentLab}
                  theme={theme}
                  onRunCommand={handleRunCommand}
                  onCheckLab={handleCheckLab}
                  onClosePanel={() => setIsGuideOpen(false)}
                  onResetLab={handleResetLab}
                />
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
