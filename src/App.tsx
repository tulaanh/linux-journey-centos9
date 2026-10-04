import React, { useState, useEffect, useCallback } from 'react';
import { CentOSKernel } from './services/centosKernel';
import { GRASSHOPPER_MODULES, COMMAND_LINE_LABS } from './services/labsData';
import type { CourseModule, LabDefinition } from './types/linux';
import { LinuxJourneyHome } from './components/LinuxJourneyHome';
import { CommandLineSyllabus } from './components/CommandLineSyllabus';
import { ChallengesCatalog } from './components/ChallengesCatalog';
import {
  challengeToLabDefinition,
  type ChallengeDefinition,
} from './services/challengesData';
import { hasLessonDoc, getLessonById } from './services/lessonLoader';
import { LabWorkspace } from './components/LabWorkspace';
import { FileBrowserModal } from './components/FileBrowserModal';
import { GuideModal } from './components/GuideModal';

export const App: React.FC = () => {
  // Kernel singleton instance
  const [kernel] = useState<CentOSKernel>(() => new CentOSKernel());
  const [, setKernelVersion] = useState(0);

  // 4 View Modes:
  // 'home' -> Linux Journey Grasshopper 8-card grid (matches user's LabEx screenshot)
  // 'syllabus' -> Selected Module Overview + Interactive Lessons Stepper
  // 'challenges' -> Real-world Linux Hands-On Challenges Catalog
  // 'practice' -> Split-pane CentOS 9 Workspace (Left: VM Terminal, Right: Step Guide or Challenge Panel)
  const [viewMode, setViewMode] = useState<'home' | 'syllabus' | 'challenges' | 'practice'>('home');
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeDefinition | null>(null);

  // Current active module (defaults to Command Line)
  const [currentModule, setCurrentModule] = useState<CourseModule>(
    () => GRASSHOPPER_MODULES.find((m) => m.id === 'command-line') || GRASSHOPPER_MODULES[0]
  );

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

  // Initial completed labs
  const [completedLabIds, setCompletedLabIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('centos_completed_labs');
      if (saved) return JSON.parse(saved);
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } catch {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
  });

  // Initial completed challenges
  const [completedChallengeIds, setCompletedChallengeIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('centos_completed_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current active lab
  const [currentLab, setCurrentLab] = useState<LabDefinition>(() => {
    const firstIncomplete = COMMAND_LINE_LABS.find(
      (l) => ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(l.id)
    );
    return firstIncomplete || COMMAND_LINE_LABS[0];
  });

  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Force re-render when kernel state updates
  const refreshKernel = useCallback(() => {
    setKernelVersion((v) => v + 1);
  }, []);

  // Level 1 -> Level 2: Select a Grasshopper module card on Home view
  const handleSelectModule = (module: CourseModule) => {
    setCurrentModule(module);
    setViewMode('syllabus');
  };

  // Level 2 -> Level 3: Select a specific lesson/lab
  const handleSelectLab = (lab: LabDefinition) => {
    setCurrentChallenge(null);
    setCurrentLab(lab);
    lab.setupState(kernel);
    refreshKernel();
    setViewMode('practice');
  };

  // Select a Challenge from Catalog
  const handleSelectChallenge = (challenge: ChallengeDefinition) => {
    setCurrentChallenge(challenge);
    const convertedLab = challengeToLabDefinition(challenge);
    setCurrentLab(convertedLab);
    challenge.setupState(kernel);
    refreshKernel();
    setViewMode('practice');
  };

  // Direct jump from search on Home view
  const handleSelectLabDirectly = (module: CourseModule, lab: LabDefinition) => {
    setCurrentModule(module);
    handleSelectLab(lab);
  };

  const handleContinueLearning = () => {
    const moduleLabs = currentModule.labs;
    const nextIncomplete =
      moduleLabs.find((l) => !completedLabIds.includes(l.id)) || moduleLabs[0] || currentLab;
    handleSelectLab(nextIncomplete);
  };

  const handleResetProgress = () => {
    if (window.confirm(`Đặt lại tiến độ các bài học của chủ đề ${currentModule.title}?`)) {
      const moduleLabIds = new Set(currentModule.labs.map((l) => l.id));
      const next = completedLabIds.filter((id) => !moduleLabIds.has(id));
      setCompletedLabIds(next);
      try {
        localStorage.setItem('centos_completed_labs', JSON.stringify(next));
      } catch {
        // ignore
      }
    }
  };

  const handleResetVM = () => {
    if (window.confirm('Reset toàn bộ máy ảo CentOS Stream 9 về trạng thái sạch ban đầu?')) {
      kernel.initDefaultState();
      currentLab.setupState(kernel);
      refreshKernel();
    }
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

  // Setup initial lab on mount
  useEffect(() => {
    currentLab.setupState(kernel);
    refreshKernel();
  }, []);

  const isDark = theme === 'dark';
  const activeModuleLabs = currentModule.labs;

  return (
    <div
      className={`h-screen w-screen overflow-hidden font-sans select-none transition-colors ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* LEVEL 1: LINUX JOURNEY HOME VIEW (Grasshopper 8-Card Grid) */}
      {viewMode === 'home' ? (
        <div className="h-full overflow-y-auto">
          <LinuxJourneyHome
            modules={GRASSHOPPER_MODULES}
            completedLabIds={completedLabIds}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelectModule={handleSelectModule}
            onNavigateChallenges={() => setViewMode('challenges')}
            onSelectLabDirectly={handleSelectLabDirectly}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onResetVM={handleResetVM}
          />
        </div>
      ) : viewMode === 'syllabus' ? (
        /* LEVEL 2: MODULE SYLLABUS VIEW */
        <div className="h-full overflow-y-auto">
          <CommandLineSyllabus
            module={currentModule}
            labs={activeModuleLabs}
            completedLabIds={completedLabIds}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToHome={() => setViewMode('home')}
            onNavigateChallenges={() => setViewMode('challenges')}
            onSelectLab={handleSelectLab}
            onContinueLearning={handleContinueLearning}
            onResetProgress={handleResetProgress}
            onResetVM={handleResetVM}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>
      ) : viewMode === 'challenges' ? (
        /* LEVEL: LINUX HANDS-ON CHALLENGES CATALOG */
        <div className="h-full overflow-y-auto">
          <ChallengesCatalog
            completedChallengeIds={completedChallengeIds}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelectChallenge={handleSelectChallenge}
            onNavigateHome={() => setViewMode('home')}
            onNavigateLearn={() => setViewMode('syllabus')}
            onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        </div>
      ) : (
        /* LEVEL 3: LAB WORKSPACE CHUẨN LABEX (MÁY ẢO BÊN TRÁI, NHIỆM VỤ / THỬ THÁCH BÊN PHẢI) */
        <LabWorkspace
          kernel={kernel}
          currentLab={currentLab}
          lessonDoc={!currentChallenge && hasLessonDoc(currentLab.id) ? getLessonById(currentLab.id) : undefined}
          currentChallenge={currentChallenge || undefined}
          currentModule={currentModule}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBackToHome={() => setViewMode('home')}
          onBackToSyllabus={() => setViewMode('syllabus')}
          onBackToChallenges={() => setViewMode('challenges')}
          onResetVM={handleResetVM}
          onOpenFileBrowser={() => setIsFileBrowserOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onToggleUser={handleToggleUser}
          refreshKernel={refreshKernel}
          completedLabIds={currentChallenge ? completedChallengeIds : completedLabIds}
          onCompleteLab={(labId) => {
            if (currentChallenge && currentChallenge.id === labId) {
              if (!completedChallengeIds.includes(labId)) {
                const next = [...completedChallengeIds, labId];
                setCompletedChallengeIds(next);
                try {
                  localStorage.setItem('centos_completed_challenges', JSON.stringify(next));
                } catch {
                  // ignore
                }
              }
            } else {
              if (!completedLabIds.includes(labId)) {
                const next = [...completedLabIds, labId];
                setCompletedLabIds(next);
                try {
                  localStorage.setItem('centos_completed_labs', JSON.stringify(next));
                } catch {
                  // ignore
                }
              }
            }
          }}
        />
      )}

      {/* File Browser Modal */}
      <FileBrowserModal
        isOpen={isFileBrowserOpen}
        vfs={kernel.vfs}
        onClose={() => setIsFileBrowserOpen(false)}
          onEditFile={(path) => {
          setIsFileBrowserOpen(false);
            kernel.onOpenEditor?.(path, kernel.vfs.readFile(path) ?? '');
        }}
      />

      {/* User Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;
