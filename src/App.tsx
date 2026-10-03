import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CentOSKernel } from './services/centosKernel';
import { LABS } from './services/labsData';
import type { LabDefinition, LabCheckResult } from './types/linux';
import { CommandLineSyllabus } from './components/CommandLineSyllabus';
import { ShellLessonView } from './components/ShellLessonView';
import { PwdLessonView } from './components/PwdLessonView';
import { TopNav } from './components/TopNav';
import { LabSidebar } from './components/LabSidebar';
import { TerminalView } from './components/TerminalView';
import { FileEditorModal } from './components/FileEditorModal';
import { FileBrowserModal } from './components/FileBrowserModal';
import { GuideModal } from './components/GuideModal';

export const App: React.FC = () => {
  // Kernel singleton instance
  const [kernel] = useState<CentOSKernel>(() => new CentOSKernel());
  const [, setKernelVersion] = useState(0);

  // View mode: 'syllabus' (Course view matching Image 2) or 'practice' (Interactive Lab & Terminal)
  const [viewMode, setViewMode] = useState<'syllabus' | 'practice'>('syllabus');
  const [forceGradingLab, setForceGradingLab] = useState<boolean>(false);

  // Theme state: dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('centos_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('centos_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Initial completed labs: default to 1..10 to match Image 2 (53% complete, 10/19) if not previously modified
  const [completedLabIds, setCompletedLabIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('centos_completed_labs');
      if (saved) return JSON.parse(saved);
      // Default to Image 2 state (first 10 completed, 11-19 pending)
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } catch {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
  });

  // Current active lab
  const [currentLab, setCurrentLab] = useState<LabDefinition>(() => {
    // Pick the first incomplete lab (e.g. #11 'mv (Move)') or the first lab
    const firstIncomplete = LABS.find((l) => ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(l.id));
    return firstIncomplete || LABS[0];
  });

  // Modals state
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    filePath: string;
    content: string;
  }>({
    isOpen: false,
    filePath: '',
    content: '',
  });

  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Split-pane width state
  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  const isDragging = useRef<boolean>(false);

  // Force re-render when kernel state updates
  const refreshKernel = useCallback(() => {
    setKernelVersion((v) => v + 1);
  }, []);

  // Setup current lab when changed
  const handleSelectLab = (lab: LabDefinition) => {
    setCurrentLab(lab);
    setForceGradingLab(false);
    lab.setupState(kernel);
    refreshKernel();
    setViewMode('practice');
  };

  const handleContinueLearning = () => {
    // Find first incomplete lab or fallback to current
    const nextIncomplete = LABS.find((l) => !completedLabIds.includes(l.id)) || currentLab;
    handleSelectLab(nextIncomplete);
  };

  const handleResetProgress = () => {
    if (window.confirm('Đặt lại toàn bộ tiến độ các bài học về 0/19?')) {
      setCompletedLabIds([]);
      try {
        localStorage.setItem('centos_completed_labs', JSON.stringify([]));
      } catch {
        // ignore
      }
    }
  };

  const handleResetLab = () => {
    currentLab.setupState(kernel);
    refreshKernel();
  };

  const handleEvaluateLab = (): LabCheckResult[] => {
    const results = currentLab.evaluate(kernel);
    const totalEarned = results.reduce((acc, r) => acc + r.pointsEarned, 0);
    const totalMax = results.reduce((acc, r) => acc + r.maxPoints, 0);

    if (totalEarned === totalMax && totalMax > 0) {
      if (!completedLabIds.includes(currentLab.id)) {
        const next = [...completedLabIds, currentLab.id];
        setCompletedLabIds(next);
        try {
          localStorage.setItem('centos_completed_labs', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
    }
    return results;
  };

  const handleResetVM = () => {
    if (window.confirm('Reset toàn bộ máy ảo CentOS Stream 9 về trạng thái sạch ban đầu?')) {
      kernel.initDefaultState();
      currentLab.setupState(kernel);
      refreshKernel();
    }
  };

  const handleOpenEditor = (filePath: string, content: string) => {
    setEditorState({
      isOpen: true,
      filePath,
      content,
    });
  };

  const handleSaveEditor = (filePath: string, content: string) => {
    kernel.vfs.writeFile(filePath, content);
    refreshKernel();
  };

  const handleToggleUser = () => {
    const nextUser = kernel.currentUser === 'root' ? 'centos' : 'root';
    kernel.currentUser = nextUser;
    const userObj = kernel.users.get(nextUser);
    kernel.cwd = userObj?.home || (nextUser === 'root' ? '/root' : '/home/centos');
    kernel.env.USER = nextUser;
    kernel.env.HOME = kernel.cwd;
    refreshKernel();
  };

  // Draggable Split Divider Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newWidth = Math.max(320, Math.min(e.clientX, window.innerWidth - 400));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Setup initial lab on mount
  useEffect(() => {
    currentLab.setupState(kernel);
    refreshKernel();
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className={`h-screen w-screen overflow-hidden font-sans select-none transition-colors ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* 1. SYLLABUS VIEW: Matches Image 2 */}
      {viewMode === 'syllabus' ? (
        <div className="h-full overflow-y-auto">
          <CommandLineSyllabus
            labs={LABS}
            completedLabIds={completedLabIds}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelectLab={handleSelectLab}
            onContinueLearning={handleContinueLearning}
            onResetProgress={handleResetProgress}
            onResetVM={handleResetVM}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>
      ) : currentLab.id === 1 && !forceGradingLab ? (
        /* SPECIAL INTERACTIVE LESSON VIEW FOR LESSON 1: THE SHELL (MATCHES USER PDF) */
        <div className="h-full overflow-y-auto">
          <ShellLessonView
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToSyllabus={() => setViewMode('syllabus')}
            onNextLesson={() => {
              const nextLab = LABS.find((l) => l.id === 2);
              if (nextLab) handleSelectLab(nextLab);
            }}
            onCompleteLesson={() => {
              if (!completedLabIds.includes(1)) {
                const next = [...completedLabIds, 1];
                setCompletedLabIds(next);
                try {
                  localStorage.setItem('centos_completed_labs', JSON.stringify(next));
                } catch {
                  // ignore
                }
              }
            }}
            kernel={kernel}
            refreshKernel={refreshKernel}
            onOpenEditor={handleOpenEditor}
          />
        </div>
      ) : currentLab.id === 2 && !forceGradingLab ? (
        /* SPECIAL INTERACTIVE LESSON VIEW FOR LESSON 2: PWD (PRINT WORKING DIRECTORY) (MATCHES USER PDF) */
        <div className="h-full overflow-y-auto">
          <PwdLessonView
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToSyllabus={() => setViewMode('syllabus')}
            onNextLesson={() => {
              const nextLab = LABS.find((l) => l.id === 3);
              if (nextLab) handleSelectLab(nextLab);
            }}
            onCompleteLesson={() => {
              if (!completedLabIds.includes(2)) {
                const next = [...completedLabIds, 2];
                setCompletedLabIds(next);
                try {
                  localStorage.setItem('centos_completed_labs', JSON.stringify(next));
                } catch {
                  // ignore
                }
              }
            }}
            onSwitchToPracticeMode={() => setForceGradingLab(true)}
            kernel={kernel}
            refreshKernel={refreshKernel}
            onOpenEditor={handleOpenEditor}
          />
        </div>
      ) : (
        /* 2. PRACTICE & TERMINAL VIEW */
        <div className="flex flex-col h-full overflow-hidden">
          {/* Top Navbar */}
          <TopNav
            kernel={kernel}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            onResetVM={handleResetVM}
            onOpenGuide={() => setIsGuideOpen(true)}
            completedCount={completedLabIds.length}
            totalLabs={LABS.length}
            onToggleUser={handleToggleUser}
            onBackToSyllabus={() => setViewMode('syllabus')}
            currentLabTitle={currentLab.title}
          />

          {/* Main Workspace: Split View */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Left Side: Lab Details & Evaluator */}
            <div
              style={{ width: `${sidebarWidth}px` }}
              className="flex-shrink-0 h-full overflow-hidden select-text"
            >
              <LabSidebar
                labs={LABS}
                currentLab={currentLab}
                theme={theme}
                onSelectLab={handleSelectLab}
                onResetLab={handleResetLab}
                onEvaluateLab={handleEvaluateLab}
                completedLabIds={completedLabIds}
              />
            </div>

            {/* Resizable Divider */}
            <div
              onMouseDown={handleMouseDown}
              className={`w-1 cursor-col-resize transition-colors hover:bg-blue-500 z-10 ${
                isDark ? 'bg-[#21262d]' : 'bg-[#d0d7de]'
              }`}
            />

            {/* Right Side: xterm Interactive Terminal */}
            <div className="flex-1 h-full min-w-0 overflow-hidden">
              <TerminalView
                kernel={kernel}
                theme={theme}
                onKernelUpdate={refreshKernel}
                onOpenEditor={handleOpenEditor}
              />
            </div>
          </div>
        </div>
      )}

      {/* File Editor Modal */}
      <FileEditorModal
        isOpen={editorState.isOpen}
        filePath={editorState.filePath}
        initialContent={editorState.content}
        onSave={handleSaveEditor}
        onClose={() => setEditorState({ ...editorState, isOpen: false })}
      />

      {/* File Browser Modal */}
      <FileBrowserModal
        isOpen={isFileBrowserOpen}
        vfs={kernel.vfs}
        onClose={() => setIsFileBrowserOpen(false)}
        onEditFile={(path, content) => {
          setIsFileBrowserOpen(false);
          handleOpenEditor(path, content);
        }}
      />

      {/* User Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;
