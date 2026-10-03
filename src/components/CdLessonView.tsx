import React, { useState } from 'react';
import {
  ChevronLeft,
  RotateCcw,
  HelpCircle,
  Check,
  X,
  CheckCircle2,
  ArrowRight,
  Copy,
  Terminal,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  FlaskConical,
  Play,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CentOSKernel } from '../services/centosKernel';
import { TerminalView } from './TerminalView';

interface CdLessonViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToHome?: () => void;
  onBackToSyllabus: () => void;
  onNextLesson: () => void;
  onCompleteLesson: () => void;
  onSwitchToPracticeMode?: () => void;
  kernel: CentOSKernel;
  refreshKernel: () => void;
  onOpenEditor: (path: string, content: string) => void;
}

export const CdLessonView: React.FC<CdLessonViewProps> = ({
  theme,
  onToggleTheme,
  onBackToHome,
  onBackToSyllabus,
  onNextLesson,
  onCompleteLesson,
  onSwitchToPracticeMode,
  kernel,
  refreshKernel,
  onOpenEditor,
}) => {
  const isDark = theme === 'dark';

  // Progressive reading steps matching the 7-page Lesson 3 PDF:
  // 0: Intro, Syntax cd [DIRECTORY] & Understanding Paths (Page 1)
  // 1: Question 1: Which statement correctly describes an absolute path? (Page 2)
  // 2: Using the cd Command ($ cd /home/pete/Pictures, $ pwd) & Question 2 (Pages 2 & 3)
  // 3: Navigating to a Subdirectory ($ cd Hawaii) & Essential Navigation Shortcuts (., .., ~, -) (Pages 3 & 4)
  // 4: Question 3 (From /home/pete/Pictures to /home/pete) & Question 4 (Return to directory immediately before) (Page 4)
  // 5: Practical cd Examples ($ cd, $ cd ../.., $ cd "Vacation Photos") & Question 5 (Page 5)
  // 6: Go back to previous directory ($ cd -) & Hands-on Labs (Page 6)
  // 7: Lesson Complete Summary Card with 5 takeaways (Pages 6 & 7)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);

  // Interactive Quiz Answers state (5 Questions from the PDF)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: null,
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTerminalSplit, setShowTerminalSplit] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<{ id: number; command: string } | null>(null);
  const [expandedHandsOn, setExpandedHandsOn] = useState<boolean>(true);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunInTerminal = (cmd: string) => {
    setShowTerminalSplit(true);
    setPendingCommand({ id: Date.now() + Math.random(), command: cmd });
  };

  const advanceStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        window.scrollBy({ top: 320, behavior: 'smooth' });
      }, 120);
      return next;
    });
  };

  // Correct answer indices from the 7-page PDF:
  // Q1: 2 ("It begins at the root directory, represented by /")
  // Q2: 2 ("pwd")
  // Q3: 2 ("cd ..")
  // Q4: 0 ("cd -")
  // Q5: 2 ('cd "Vacation Photos"')
  const handleSelectOption = (qKey: string, optIndex: number, correctIndex: number) => {
    const updated = { ...selectedAnswers, [qKey]: optIndex };
    setSelectedAnswers(updated);

    if (optIndex === correctIndex) {
      const q1Ok = qKey === 'q1' ? true : updated.q1 === 2;
      const q2Ok = qKey === 'q2' ? true : updated.q2 === 2;
      const q3Ok = qKey === 'q3' ? true : updated.q3 === 2;
      const q4Ok = qKey === 'q4' ? true : updated.q4 === 0;
      const q5Ok = qKey === 'q5' ? true : updated.q5 === 2;

      if (q1Ok && q2Ok && q3Ok && q4Ok && q5Ok) {
        onCompleteLesson();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null,
    });
    setCurrentStep(0);
    setShowAllSteps(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check interactive Hands-on tasks from kernel history
  const hist = kernel.history.map((h) => h.trim());
  const labTask1Done = hist.some(
    (h) => h.includes('/home/pete/Pictures') || h.includes('cd Hawaii')
  );
  const labTask2Done = hist.some(
    (h) => h === 'cd ..' || h === 'cd ../..' || h === 'cd -'
  );
  const labTask3Done = hist.some(
    (h) => h.includes('"Vacation Photos"') || h.includes("'Vacation Photos'")
  );
  const labTask4Done = hist.some(
    (h) => h.startsWith('mkdir') || h === 'cd' || h === 'cd ~'
  );
  const completedLabTasksCount = [
    labTask1Done,
    labTask2Done,
    labTask3Done,
    labTask4Done,
  ].filter(Boolean).length;

  const answeredCount = [
    selectedAnswers.q1 === 2,
    selectedAnswers.q2 === 2,
    selectedAnswers.q3 === 2,
    selectedAnswers.q4 === 0,
    selectedAnswers.q5 === 2,
  ].filter(Boolean).length;

  const readingProgress = Math.min(100, Math.round(((currentStep + 1) / 8) * 100));
  const isFinished = answeredCount === 5 && (currentStep >= 6 || showAllSteps);

  const isStepVisible = (stepIndex: number) => showAllSteps || currentStep >= stepIndex;

  return (
    <div
      className={`min-h-[100dvh] transition-colors duration-200 ${
        isDark ? 'bg-[#0b0f19] text-slate-200' : 'bg-[#fafbfe] text-slate-800'
      }`}
    >
      {/* Top Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#0f1422]/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-blue-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-600'
              }`}
              title="Về trang chủ Linux Journey (Grasshopper)"
            >
              <span>Linux Journey</span>
            </button>
          )}

          <button
            onClick={onBackToSyllabus}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>CD (CHANGE DIRECTORY)</span>
          </button>

          <button
            onClick={handleResetQuiz}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
            title="Học lại từ đầu (Learn again)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Learn again</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onSwitchToPracticeMode && (
            <button
              onClick={onSwitchToPracticeMode}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer hidden xl:flex items-center gap-1.5 ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Mở giao diện Lab thực hành chấm điểm toàn màn hình"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Lab Chấm điểm</span>
            </button>
          )}

          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              showAllSteps
                ? isDark
                  ? 'border-slate-700 bg-slate-800 text-blue-400'
                  : 'border-slate-300 bg-slate-100 text-blue-600'
                : isDark
                ? 'border-slate-800 text-slate-400 hover:text-slate-200'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Chuyển chế độ đọc"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showAllSteps ? 'Đang hiện tất cả' : 'Đọc từng bước'}</span>
          </button>

          <button
            onClick={() => setShowTerminalSplit(!showTerminalSplit)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showTerminalSplit
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : isDark
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {showTerminalSplit ? 'Ẩn Terminal' : 'Mở Terminal CentOS 9'}
            </span>
            <span className="sm:hidden">Terminal</span>
          </button>

          {/* Progress Percentage matching PDF top right */}
          <div className="flex items-center gap-2">
            <div
              className={`w-14 sm:w-20 h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${showAllSteps ? 100 : readingProgress}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-500">
              {showAllSteps ? 100 : readingProgress}%
            </span>
          </div>

          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reading & Split Terminal Container */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 ${
          showTerminalSplit ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''
        }`}
      >
        {/* Left Column: Progressive Reading & Quizzes */}
        <article
          className={`${
            showTerminalSplit ? 'max-w-none' : 'max-w-2xl mx-auto'
          } space-y-6 select-text`}
        >
          {/* Lesson Header Tag & Title (Page 1) */}
          <div className="animate-fadeIn">
            <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block">
              COMMAND LINE · LESSON 3
            </span>
            <h1
              className={`text-3xl sm:text-4xl font-bold tracking-tight mt-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              cd (Change Directory)
            </h1>
            <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Learn how to use <code className="font-mono text-blue-400">cd</code> with paths and
              shortcuts to move through the Linux filesystem (
              <span className="italic">
                Tìm hiểu cách dùng lệnh cd kết hợp đường dẫn và phím tắt để di chuyển trong hệ thống
                tệp tin Linux
              </span>
              ).
            </p>
          </div>

          {/* STEP 0: Intro, Basic Syntax & Understanding Paths (Page 1) */}
          {isStepVisible(0) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                To move around the Linux filesystem, you use paths to specify your destination. The
                primary tool for this is the{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  cd
                </code>{' '}
                command, short for <strong>change directory</strong>. It changes the shell&apos;s
                current working directory.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                The destination must be a directory rather than a regular file. If the directory
                does not exist, its name is typed incorrectly, or you lack permission to enter it,{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  cd
                </code>{' '}
                reports an error instead of changing location.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                The basic syntax is:
              </p>

              {/* Syntax Box matching Page 1 */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <code>cd [DIRECTORY]</code>
                <button
                  onClick={() => handleCopy('cd [DIRECTORY]')}
                  className="p-1.5 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title="Sao chép cú pháp"
                >
                  {copiedText === 'cd [DIRECTORY]' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h2
                className={`text-2xl font-bold tracking-tight pt-3 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Understanding Paths
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                There are two ways to specify a path: <strong>absolute</strong> and{' '}
                <strong>relative</strong>.
              </p>

              <ul
                className={`list-disc pl-5 space-y-3 text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <li>
                  <strong>Absolute path</strong>: The full path starting from the root directory (
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    /
                  </code>
                  ). For example:{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                    /home/pete/Desktop
                  </code>
                  .
                </li>
                <li>
                  <strong>Relative path</strong>: A path based on your current location. If you are
                  in{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                    /home/pete/Documents
                  </code>{' '}
                  and want to access a subdirectory named{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    taxes
                  </code>
                  , you can use{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                    taxes/
                  </code>
                  .
                </li>
              </ul>

              {!showAllSteps && currentStep === 0 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Câu hỏi tương tác 1</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 1: Question 1 (Page 2) */}
          {isStepVisible(1) && (
            <div
              className={`rounded-3xl border p-6 sm:p-7 transition-all duration-300 animate-fadeIn ${
                isDark
                  ? 'bg-[#111625] border-slate-800/90 shadow-xl shadow-black/30'
                  : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/50'
              }`}
            >
              <div className="flex items-start gap-3 mb-5">
                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <h3
                  className={`font-bold text-base sm:text-lg leading-snug ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Which statement correctly describes an absolute path?
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  'It begins at whichever directory the shell currently uses',
                  'It contains only the final directory name without parents',
                  'It begins at the root directory, represented by /',
                ].map((optionText, idx) => {
                  const selected = selectedAnswers.q1 === idx;
                  const isCorrect = idx === 2;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption('q1', idx, 2)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                        selected
                          ? isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-rose-500 bg-rose-500/10 text-rose-300'
                          : isDark
                          ? 'border-slate-800 bg-[#151c2e] hover:border-slate-700 text-slate-300'
                          : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selected
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-500 text-white'
                              : 'border-rose-400 bg-rose-500 text-white'
                            : isDark
                            ? 'border-slate-600'
                            : 'border-slate-400'
                        }`}
                      >
                        {selected &&
                          (isCorrect ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 stroke-[3]" />
                          ))}
                      </div>
                      <span>{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAnswers.q1 === 2 && !showAllSteps && currentStep === 1 && (
                <div className="flex justify-center pt-5 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                  >
                    <span>Tiếp tục: Using the cd Command</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Using the cd Command & Question 2 (Pages 2 & 3) */}
          {isStepVisible(2) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Using the cd Command
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                To change to a specific directory using an absolute path, type:
              </p>

              {/* Command Block: $ cd /home/pete/Pictures */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-slate-500 select-none">$ </span>
                  <span className="text-emerald-400">cd /home/pete/Pictures</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunInTerminal('cd /home/pete/Pictures')}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Chạy thử</span>
                  </button>
                  <button
                    onClick={() => handleCopy('cd /home/pete/Pictures')}
                    className="p-1.5 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {copiedText === 'cd /home/pete/Pictures' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                This command moves you directly to the{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                  Pictures
                </code>{' '}
                directory.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                You can confirm your location with{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                  pwd
                </code>
                :
              </p>

              {/* Command Block: $ pwd -> /home/pete/Pictures */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">pwd</span>
                  </div>
                  <div className="text-slate-400">/home/pete/Pictures</div>
                </div>
                <button
                  onClick={() => handleRunInTerminal('cd /home/pete/Pictures\npwd')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              {/* Question 2 Card (Pages 2 & 3) */}
              <div
                className={`rounded-3xl border p-6 sm:p-7 mt-4 transition-all duration-300 ${
                  isDark
                    ? 'bg-[#111625] border-slate-800/90 shadow-xl shadow-black/30'
                    : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-5">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <h3
                    className={`font-bold text-base sm:text-lg leading-snug ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    Which command confirms the shell&apos;s current location after{' '}
                    <code className="px-1.5 py-0.5 rounded text-sm font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                      cd
                    </code>
                    ?
                  </h3>
                </div>

                <div className="space-y-3">
                  {['cd', 'ls', 'pwd'].map((optionText, idx) => {
                    const selected = selectedAnswers.q2 === idx;
                    const isCorrect = idx === 2;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption('q2', idx, 2)}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                          selected
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : isDark
                            ? 'border-slate-800 bg-[#151c2e] hover:border-slate-700 text-slate-300'
                            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? isCorrect
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-rose-400 bg-rose-500 text-white'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-400'
                          }`}
                        >
                          {selected &&
                            (isCorrect ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[3]" />
                            ))}
                        </div>
                        <code className="px-2 py-0.5 rounded border font-mono text-xs bg-slate-800/40 border-slate-700">
                          {optionText}
                        </code>
                      </button>
                    );
                  })}
                </div>

                {selectedAnswers.q2 === 2 && !showAllSteps && currentStep === 2 && (
                  <div className="flex justify-center pt-5 animate-fadeIn">
                    <button
                      onClick={advanceStep}
                      className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                    >
                      <span>Tiếp tục: Subdirectories & Shortcuts</span>
                      <ChevronDown className="w-4 h-4 animate-bounce" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 3: Navigating to a Subdirectory & Essential Navigation Shortcuts (Pages 3 & 4) */}
          {isStepVisible(3) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Navigating to a Subdirectory
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                If you are already in a directory and want to move to a subdirectory, use a
                relative path. For instance, if your current location is{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                  /home/pete/Pictures
                </code>{' '}
                and it contains a folder named{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                  Hawaii
                </code>
                , you can navigate into it with:
              </p>

              {/* Command Block: $ cd Hawaii */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-slate-500 select-none">$ </span>
                  <span className="text-emerald-400">cd Hawaii</span>
                </div>
                <button
                  onClick={() => handleRunInTerminal('cd /home/pete/Pictures\ncd Hawaii\npwd')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Notice we only used the folder&apos;s name. This is because we were already in its
                parent directory,{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                  /home/pete/Pictures
                </code>
                .
              </p>

              <h2
                className={`text-2xl font-bold tracking-tight pt-3 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Essential Navigation Shortcuts
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Navigating with full paths can be tedious. Fortunately, the shell provides several
                shortcuts to make moving around much faster.
              </p>

              <ul
                className={`list-disc pl-5 space-y-2.5 text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <li>
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    .
                  </code>{' '}
                  (<strong>current directory</strong>): Represents the directory you are currently
                  in.
                </li>
                <li>
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    ..
                  </code>{' '}
                  (<strong>parent directory</strong>): Moves you one level up to the directory
                  containing your current one.
                </li>
                <li>
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    ~
                  </code>{' '}
                  (<strong>home directory</strong>): A shortcut to your personal home directory,
                  like{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                    /home/pete
                  </code>
                  .
                </li>
                <li>
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                    -
                  </code>{' '}
                  (<strong>previous directory</strong>): Takes you back to the last directory you
                  were in.
                </li>
              </ul>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                You can use these shortcuts with{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                  cd
                </code>
                :
              </p>

              {/* Shortcuts Box matching Page 4 */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-1.5">
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">cd .</span>
                  </div>
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">cd ..</span>
                  </div>
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">cd ~</span>
                  </div>
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">cd -</span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal('cd /home/pete/Pictures\ncd .\ncd ..\npwd\ncd -')
                  }
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              {!showAllSteps && currentStep === 3 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Làm câu hỏi tương tác 3 & 4</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 4: Question 3 & Question 4 (Page 4) */}
          {isStepVisible(4) && (
            <div className="space-y-6 animate-fadeIn">
              {/* Question 3 */}
              <div
                className={`rounded-3xl border p-6 sm:p-7 transition-all duration-300 ${
                  isDark
                    ? 'bg-[#111625] border-slate-800/90 shadow-xl shadow-black/30'
                    : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-5">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <h3
                    className={`font-bold text-base sm:text-lg leading-snug ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    From{' '}
                    <code className="px-1.5 py-0.5 rounded text-sm font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                      /home/pete/Pictures
                    </code>
                    , which command moves to{' '}
                    <code className="px-1.5 py-0.5 rounded text-sm font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                      /home/pete
                    </code>
                    ?
                  </h3>
                </div>

                <div className="space-y-3">
                  {['cd .', 'cd -', 'cd ..'].map((optionText, idx) => {
                    const selected = selectedAnswers.q3 === idx;
                    const isCorrect = idx === 2;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption('q3', idx, 2)}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                          selected
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : isDark
                            ? 'border-slate-800 bg-[#151c2e] hover:border-slate-700 text-slate-300'
                            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? isCorrect
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-rose-400 bg-rose-500 text-white'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-400'
                          }`}
                        >
                          {selected &&
                            (isCorrect ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[3]" />
                            ))}
                        </div>
                        <code className="px-2 py-0.5 rounded border font-mono text-xs bg-slate-800/40 border-slate-700">
                          {optionText}
                        </code>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 4 */}
              <div
                className={`rounded-3xl border p-6 sm:p-7 transition-all duration-300 ${
                  isDark
                    ? 'bg-[#111625] border-slate-800/90 shadow-xl shadow-black/30'
                    : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-5">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <h3
                    className={`font-bold text-base sm:text-lg leading-snug ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    Which command returns to the directory used immediately before the current one?
                  </h3>
                </div>

                <div className="space-y-3">
                  {['cd -', 'cd ..', 'cd ~'].map((optionText, idx) => {
                    const selected = selectedAnswers.q4 === idx;
                    const isCorrect = idx === 0;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption('q4', idx, 0)}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                          selected
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : isDark
                            ? 'border-slate-800 bg-[#151c2e] hover:border-slate-700 text-slate-300'
                            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? isCorrect
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-rose-400 bg-rose-500 text-white'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-400'
                          }`}
                        >
                          {selected &&
                            (isCorrect ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[3]" />
                            ))}
                        </div>
                        <code className="px-2 py-0.5 rounded border font-mono text-xs bg-slate-800/40 border-slate-700">
                          {optionText}
                        </code>
                      </button>
                    );
                  })}
                </div>

                {selectedAnswers.q3 === 2 &&
                  selectedAnswers.q4 === 0 &&
                  !showAllSteps &&
                  currentStep === 4 && (
                    <div className="flex justify-center pt-5 animate-fadeIn">
                      <button
                        onClick={advanceStep}
                        className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                      >
                        <span>Tiếp tục: Practical cd Examples</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                      </button>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* STEP 5: Practical cd Examples & Question 5 (Page 5) */}
          {isStepVisible(5) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Experiment with these shortcuts to become more efficient on the command line.
              </p>

              <h2
                className={`text-2xl font-bold tracking-tight pt-1 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Practical cd Examples
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Go to your home directory:
              </p>

              {/* $ cd */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-slate-500 select-none">$ </span>
                  <span className="text-emerald-400">cd</span>
                </div>
                <button
                  onClick={() => handleRunInTerminal('cd\npwd')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Running{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                  cd
                </code>{' '}
                with no directory argument also takes you to your home directory.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Go up two levels:
              </p>

              {/* $ cd ../.. */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-slate-500 select-none">$ </span>
                  <span className="text-emerald-400">cd ../..</span>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal('cd /home/pete/Pictures/Hawaii\ncd ../..\npwd')
                  }
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Go to a directory whose name contains spaces by quoting it:
              </p>

              {/* $ cd "Vacation Photos" */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <span className="text-slate-500 select-none">$ </span>
                  <span className="text-emerald-400">cd &quot;Vacation Photos&quot;</span>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal('cd /home/pete/Pictures\ncd "Vacation Photos"\npwd')
                  }
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              {/* Question 5 Card (Page 5) */}
              <div
                className={`rounded-3xl border p-6 sm:p-7 mt-4 transition-all duration-300 ${
                  isDark
                    ? 'bg-[#111625] border-slate-800/90 shadow-xl shadow-black/30'
                    : 'bg-white border-slate-200/90 shadow-lg shadow-slate-200/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-5">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <h3
                    className={`font-bold text-base sm:text-lg leading-snug ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    Which command treats{' '}
                    <code className="px-1.5 py-0.5 rounded text-sm font-mono border bg-slate-800/60 border-slate-700 text-emerald-400">
                      Vacation Photos
                    </code>{' '}
                    as one directory name?
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    'cd Vacation Photos',
                    '"cd Vacation Photos"',
                    'cd "Vacation Photos"',
                  ].map((optionText, idx) => {
                    const selected = selectedAnswers.q5 === idx;
                    const isCorrect = idx === 2;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption('q5', idx, 2)}
                        className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-3.5 transition-all cursor-pointer ${
                          selected
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-500 bg-rose-500/10 text-rose-300'
                            : isDark
                            ? 'border-slate-800 bg-[#151c2e] hover:border-slate-700 text-slate-300'
                            : 'border-slate-300 bg-white hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? isCorrect
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-rose-400 bg-rose-500 text-white'
                              : isDark
                              ? 'border-slate-600'
                              : 'border-slate-400'
                          }`}
                        >
                          {selected &&
                            (isCorrect ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 stroke-[3]" />
                            ))}
                        </div>
                        <code className="px-2 py-0.5 rounded border font-mono text-xs bg-slate-800/40 border-slate-700">
                          {optionText}
                        </code>
                      </button>
                    );
                  })}
                </div>

                {selectedAnswers.q5 === 2 && !showAllSteps && currentStep === 5 && (
                  <div className="flex justify-center pt-5 animate-fadeIn">
                    <button
                      onClick={advanceStep}
                      className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                    >
                      <span>Tiếp tục: Hands-on Labs</span>
                      <ChevronDown className="w-4 h-4 animate-bounce" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 6: Go back to previous directory & Hands-on Labs (Page 6) */}
          {isStepVisible(6) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Go back to the previous directory:
              </p>

              {/* $ cd - -> /home/pete/Documents */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 select-none">$ </span>
                    <span className="text-emerald-400">cd -</span>
                  </div>
                  <div className="text-slate-400">/home/pete/Documents</div>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal('cd /home/pete/Documents\ncd /home/pete/Pictures\ncd -')
                  }
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Chạy thử</span>
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed pt-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                To reinforce your understanding of Linux directory navigation, try these hands-on
                labs:
              </p>

              {/* 1. Linux cd Command: Directory Changing (Interactive Expandable Card) */}
              <div
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDark
                    ? 'bg-[#101626] border-blue-500/30 shadow-lg shadow-blue-950/20'
                    : 'bg-white border-blue-200 shadow-md'
                }`}
              >
                <div
                  onClick={() => setExpandedHandsOn(!expandedHandsOn)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Interactive Lab
                      </span>
                      <h3
                        className={`font-bold text-sm sm:text-base underline decoration-blue-500/50 underline-offset-4 ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        1. Linux cd Command: Directory Changing
                      </h3>
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      Learn the Linux <code className="font-mono text-blue-400">cd</code> command to
                      efficiently navigate your file system, including various techniques for
                      changing directories, understanding paths, and exploring the file structure.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                      {completedLabTasksCount}/4
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedHandsOn ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {expandedHandsOn && (
                  <div
                    className={`px-4 sm:px-5 pb-5 pt-2 border-t space-y-3 text-xs sm:text-sm ${
                      isDark ? 'border-slate-800/80 bg-[#0d1220]' : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    {/* Step 1 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labTask1Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labTask1Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              1
                            </span>
                          )}
                          <span>Bước 1: Di chuyển bằng đường dẫn tuyệt đối & tương đối</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Chuyển tới <code className="font-mono text-blue-400">/home/pete/Pictures</code>{' '}
                          và đi vào thư mục con <code className="font-mono text-emerald-400">Hawaii</code>.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRunInTerminal('cd /home/pete/Pictures\ncd Hawaii\npwd')
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thực hành</span>
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labTask2Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labTask2Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              2
                            </span>
                          )}
                          <span>Bước 2: Sử dụng phím tắt cd .., cd ../.. và cd -</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Lùi lên thư mục cha bằng <code className="font-mono text-blue-400">cd ..</code>{' '}
                          và quay lại thư mục trước đó bằng <code className="font-mono text-emerald-400">cd -</code>.
                        </p>
                      </div>
                      <button
                        onClick={() => handleRunInTerminal('cd ..\npwd\ncd -')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thực hành</span>
                      </button>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labTask3Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labTask3Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              3
                            </span>
                          )}
                          <span>Bước 3: Vào thư mục có khoảng trắng &quot;Vacation Photos&quot;</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Đặt tên thư mục trong dấu ngoặc kép:{' '}
                          <code className="font-mono text-emerald-400">cd &quot;Vacation Photos&quot;</code>.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRunInTerminal('cd /home/pete/Pictures\ncd "Vacation Photos"\npwd')
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thực hành</span>
                      </button>
                    </div>

                    {/* Step 4 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labTask4Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labTask4Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              4
                            </span>
                          )}
                          <span>Bước 4: Quay về thư mục Home với cd hoặc cd ~</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Gõ <code className="font-mono text-blue-400">cd</code> hoặc{' '}
                          <code className="font-mono text-emerald-400">cd ~</code> để trở về thư mục
                          cá nhân ngay lập tức.
                        </p>
                      </div>
                      <button
                        onClick={() => handleRunInTerminal('cd ~\npwd')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thực hành</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Linux Directory Navigation */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#111625] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <h3
                    className={`font-bold text-sm sm:text-base underline decoration-blue-500/40 underline-offset-4 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    2. Linux Directory Navigation
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Put your basic Linux command-line skills to the test by navigating through
                    directories using essential commands.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal(
                      'cd /home/pete/Documents\ncd taxes/\npwd\ncd ../..\npwd'
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-blue-400'
                      : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-blue-700'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Thực hành điều hướng</span>
                </button>
              </div>

              {/* 3. Setting Up a New Project Structure */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#111625] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <h3
                    className={`font-bold text-sm sm:text-base underline decoration-blue-500/40 underline-offset-4 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}
                  >
                    3. Setting Up a New Project Structure
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Practice your Linux directory management skills by creating a specific project
                    structure and navigating through it using essential commands like{' '}
                    <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                      mkdir
                    </code>{' '}
                    and{' '}
                    <code className="px-1.5 py-0.5 rounded text-xs font-mono border bg-slate-800/60 border-slate-700 text-blue-400">
                      cd
                    </code>
                    .
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal(
                      'mkdir -p /home/pete/projects/webapp/src\ncd /home/pete/projects/webapp/src\npwd'
                    )
                  }
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer ${
                    isDark
                      ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tạo & Điều hướng</span>
                </button>
              </div>

              {!showAllSteps && currentStep === 6 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Hoàn tất bài học</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 7: Lesson Complete Card (Pages 6 & 7) */}
          {isStepVisible(7) && (
            <section
              className={`rounded-3xl border p-8 text-center transition-all animate-fadeIn ${
                isFinished
                  ? isDark
                    ? 'bg-[#101726] border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                    : 'bg-white border-emerald-300 shadow-xl shadow-emerald-100/50'
                  : isDark
                  ? 'bg-[#101522] border-slate-800/80 opacity-95'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${
                  isFinished
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block mb-1">
                LESSON COMPLETE
              </span>

              <h3
                className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                You finished cd (Change Directory)
              </h3>

              <p
                className={`text-sm mt-2 max-w-md mx-auto leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                You can now use cd to move between directories with full paths and shell shortcuts.
              </p>

              {/* 5 Summary Bullet Checkmarks matching Pages 6 & 7 */}
              <div className="max-w-md mx-auto text-left mt-6 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-blue-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Distinguish absolute paths from relative paths.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Change directories and verify the result with pwd.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Move to parent, home, and previous directories.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Enter directory names that contain spaces.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-blue-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Recognize common path and permission errors.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={onNextLesson}
                  className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetQuiz}
                  className={`px-5 py-2.5 rounded-full border text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Learn again</span>
                </button>
              </div>

              <div className="mt-5">
                <button
                  onClick={onBackToSyllabus}
                  className={`text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Back to Command Line
                </button>
              </div>
            </section>
          )}
        </article>

        {/* Right Column: Live CentOS 9 Terminal */}
        {showTerminalSplit && (
          <aside className="lg:sticky lg:top-20 h-[650px] flex flex-col rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl bg-[#0f1422] animate-fadeIn">
            <div className="px-4 py-2.5 border-b border-slate-800 bg-[#121727] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-emerald-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>CentOS Stream 9 (KVM MicroVM • 5.14.0-el9)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans">
                Thử gõ: <code className="text-blue-400">cd /home/pete/Pictures</code> hoặc{' '}
                <code className="text-blue-400">cd &quot;Vacation Photos&quot;</code>
              </span>
            </div>

            <div className="flex-1 min-h-0">
              <TerminalView
                kernel={kernel}
                theme={theme}
                onKernelUpdate={refreshKernel}
                onOpenEditor={onOpenEditor}
                pendingCommand={pendingCommand}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
