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
  FolderTree,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CentOSKernel } from '../services/centosKernel';
import { TerminalView } from './TerminalView';

interface PwdLessonViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToSyllabus: () => void;
  onNextLesson: () => void;
  onCompleteLesson: () => void;
  onSwitchToPracticeMode?: () => void;
  kernel: CentOSKernel;
  refreshKernel: () => void;
  onOpenEditor: (path: string, content: string) => void;
}

export const PwdLessonView: React.FC<PwdLessonViewProps> = ({
  theme,
  onToggleTheme,
  onBackToSyllabus,
  onNextLesson,
  onCompleteLesson,
  onSwitchToPracticeMode,
  kernel,
  refreshKernel,
  onOpenEditor,
}) => {
  const isDark = theme === 'dark';

  // Progressive reading steps matching the 6-page Lesson 2 PDF:
  // 0: Intro & The Directory Tree in Linux (Page 1 & top of Page 2)
  // 1: Question 1: How are home and etc related to /? (Page 2)
  // 2: Understanding File Paths (/home/pete/Movies, Absolute vs Relative) (Page 2)
  // 3: Question 2: What makes /home/pete/Movies an absolute path? (Page 3)
  // 4: What is the Full Form of PWD in Linux? & Question 3: What does pwd stand for? (Page 3)
  // 5: Using the pwd Command ($ pwd -> /home/pete, pwd vs cd) (Page 3 & Page 4)
  // 6: Question 4: Which action checks your current directory without changing it? (Page 4)
  // 7: Why pwd is Useful & /home/pete/projects example (Page 4 & Page 5)
  // 8: Hands-on Labs (LabEx #209734: Linux pwd Command: Directory Displaying, Navigation, cd) (Page 5)
  // 9: Lesson Complete Summary Card (Page 6)
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);

  // Interactive Quiz Answers state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({
    q1: null,
    q2: null,
    q3: null,
    q4: null,
  });

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTerminalSplit, setShowTerminalSplit] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<{ id: number; command: string } | null>(null);
  const [expandedLabEx, setExpandedLabEx] = useState<boolean>(true);

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

  // Correct answer indices from the PDF:
  // Q1: 0 ("They are subdirectories that branch from /.")
  // Q2: 2 ("It starts at root with a leading /.")
  // Q3: 0 ("Print working directory")
  // Q4: 2 ("Run pwd and read the absolute path it prints.")
  const handleSelectOption = (qKey: string, optIndex: number, correctIndex: number) => {
    const updated = { ...selectedAnswers, [qKey]: optIndex };
    setSelectedAnswers(updated);

    if (optIndex === correctIndex) {
      const q1Ok = qKey === 'q1' ? true : updated.q1 === 0;
      const q2Ok = qKey === 'q2' ? true : updated.q2 === 2;
      const q3Ok = qKey === 'q3' ? true : updated.q3 === 0;
      const q4Ok = qKey === 'q4' ? true : updated.q4 === 2;

      if (q1Ok && q2Ok && q3Ok && q4Ok) {
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
    });
    setCurrentStep(0);
    setShowAllSteps(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check interactive LabEx 209734 tasks from kernel history
  const hist = kernel.history.map((h) => h.trim());
  const labStep1Done = hist.some((h) => h === 'pwd' || h.startsWith('pwd '));
  const labStep2Done =
    kernel.cwd === '/home/pete/projects' ||
    hist.some((h) => h.includes('/home/pete/projects'));
  const labStep3Done = hist.some(
    (h) => h.includes('pwd -P') || h.includes('pwd --physical') || h.includes('/tmp/mylogs')
  );
  const labStep4Done = hist.some(
    (h) => h.includes('$(pwd)') || h.includes('$PWD')
  );
  const completedLabTasksCount = [labStep1Done, labStep2Done, labStep3Done, labStep4Done].filter(
    Boolean
  ).length;

  // Score & progress calculation
  const answeredCount = [
    selectedAnswers.q1 === 0,
    selectedAnswers.q2 === 2,
    selectedAnswers.q3 === 0,
    selectedAnswers.q4 === 2,
  ].filter(Boolean).length;

  const readingProgress = Math.min(100, Math.round(((currentStep + 1) / 10) * 100));
  const isFinished = answeredCount === 4 && (currentStep >= 8 || showAllSteps);

  const isStepVisible = (stepIndex: number) => showAllSteps || currentStep >= stepIndex;

  const directoryTreeText = `/
|-- bin
|   |-- file1
|   |-- file2
|-- etc
|   |-- file3
|   \`-- directory1
|       |-- file4
|       \`-- file5
|-- home
|-- var`;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0b0f19] text-slate-200' : 'bg-[#fafbfe] text-slate-800'
      }`}
    >
      {/* Top Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#0f1422]/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSyllabus}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PWD (PRINT WORKING DIRECTORY)</span>
          </button>

          <button
            onClick={handleResetQuiz}
            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Học lại từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Học lại</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Switch to Full Practice / Grading Lab Mode */}
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

          {/* Toggle Step-by-Step vs Show All */}
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

          {/* Live Terminal Split View Toggle */}
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

          {/* Progress Pill */}
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

          {/* Theme Toggle */}
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
              COMMAND LINE · LESSON 2 (BÀI HỌC 2)
            </span>
            <h1
              className={`text-3xl sm:text-4xl font-bold tracking-tight mt-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              pwd (Print Working Directory)
            </h1>
            <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tìm hiểu cách sử dụng <code className="font-mono text-blue-400">pwd</code> để xác định
              vị trí hiện tại của bạn trong hệ thống tệp tin Linux (
              <span className="italic">
                Learn how to use pwd to identify your current location in the Linux filesystem
              </span>
              ).
            </p>
          </div>

          {/* STEP 0: Intro & The Directory Tree in Linux (Page 1 & Top of Page 2) */}
          {isStepVisible(0) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Trong Linux, các tệp tin (files) và thư mục (directories) được tổ chức theo một cấu
                trúc phân cấp gọi là <strong>hệ thống tệp tin (filesystem)</strong>. Trước khi có thể
                di chuyển tự tin bên trong hệ thống, bạn cần biết mình đang đứng ở đâu. Câu lệnh{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pwd
                </code>{' '}
                trả lời câu hỏi đó bằng cách in ra thư mục làm việc hiện tại (
                <em>current working directory</em>) của bạn.
              </p>

              <h2
                className={`text-2xl font-bold tracking-tight pt-2 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                The Directory Tree in Linux (Cây thư mục trong Linux)
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Toàn bộ hệ thống tệp tin bắt đầu từ một thư mục cấp cao nhất duy nhất gọi là{' '}
                <strong>thư mục gốc (root directory)</strong>, được biểu diễn bằng dấu gạch chéo xuôi (
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  /
                </code>
                ). Từ thư mục gốc, cây thư mục phân nhánh thành các thư mục con (
                <em>subdirectories</em>), bên trong đó lại có thể chứa các tệp tin và nhiều thư mục
                con khác.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Dưới đây là một ví dụ đơn giản minh họa cấu trúc này:
              </p>

              {/* Directory Tree Box matching Page 1-2 */}
              <div
                className={`p-5 rounded-xl border font-mono text-xs sm:text-sm relative group ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-slate-900 text-slate-100 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <pre className="leading-relaxed text-emerald-300/90 overflow-x-auto">
                    {directoryTreeText}
                  </pre>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunInTerminal('tree /etc')}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 shadow-sm transition cursor-pointer"
                      title="Xem cây thư mục trong terminal CentOS 9"
                    >
                      <FolderTree className="w-3 h-3" />
                      <span>Xem cây thư mục</span>
                    </button>
                    <button
                      onClick={() => handleCopy(directoryTreeText)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Sao chép sơ đồ cây"
                    >
                      {copiedText === directoryTreeText ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {!showAllSteps && currentStep === 0 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Làm câu hỏi tương tác 1</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 1: Interactive Question 1 (Page 2) */}
          {isStepVisible(1) && (
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
                isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3
                  className={`font-semibold text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Trong cây thư mục ở trên, hai thư mục{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    home
                  </code>{' '}
                  và{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    etc
                  </code>{' '}
                  có mối quan hệ như thế nào với{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    /
                  </code>
                  ?
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    text: 'Chúng là các thư mục con (subdirectories) phân nhánh trực tiếp từ /. (They are subdirectories that branch from /.)',
                    isCorrect: true,
                  },
                  {
                    text: 'Chúng là các tệp tin được lưu bên trong thư mục bin. (They are files stored inside the bin directory.)',
                    isCorrect: false,
                  },
                  {
                    text: 'Chúng là các tên gọi thay thế cho thư mục gốc. (They are alternate names for the root directory.)',
                    isCorrect: false,
                  },
                ].map((opt, idx) => {
                  const isSelected = selectedAnswers.q1 === idx;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showIncorrect = isSelected && !opt.isCorrect;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption('q1', idx, 0)}
                      className={`group flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        showCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : showIncorrect
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : isDark
                          ? 'bg-[#151b2c] border-slate-800/80 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showIncorrect
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : isDark
                            ? 'border-slate-600 group-hover:border-slate-400'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedAnswers.q1 === 0 && (
                <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Chính xác! Cả <code className="font-mono">home</code> và{' '}
                    <code className="font-mono">etc</code> đều là các thư mục con nằm ngay dưới thư
                    mục gốc <code className="font-mono">/</code>.
                  </span>
                </div>
              )}
              {selectedAnswers.q1 !== null && selectedAnswers.q1 !== 0 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>
                    Chưa đúng. Nhìn vào sơ đồ cây, các nhánh <code className="font-mono">|-- home</code>{' '}
                    và <code className="font-mono">|-- etc</code> đều xuất phát trực tiếp từ gốc{' '}
                    <code className="font-mono">/</code>.
                  </span>
                </div>
              )}

              {!showAllSteps && currentStep === 1 && selectedAnswers.q1 === 0 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Tiếp tục bài học</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Understanding File Paths (Page 2) */}
          {isStepVisible(2) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Understanding File Paths (Tìm hiểu về Đường dẫn Tệp tin)
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Vị trí của bất kỳ tệp tin hay thư mục nào đều được mô tả bởi{' '}
                <strong>đường dẫn (path)</strong> của nó. Một đường dẫn là một chuỗi các thư mục nối
                tiếp nhau dẫn từ điểm xuất phát đến một đích đến cụ thể.
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Ví dụ: nếu bạn có một thư mục tên là{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pete
                </code>{' '}
                bên trong{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  /home
                </code>
                , và một thư mục{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  Movies
                </code>{' '}
                bên trong{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pete
                </code>
                , thì đường dẫn đầy đủ là:
              </p>

              {/* Path Code Box */}
              <div
                className={`p-4 rounded-xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-blue-400'
                    : 'bg-slate-900 text-blue-300 border-slate-800'
                }`}
              >
                <span>/home/pete/Movies</span>
                <button
                  onClick={() => handleCopy('/home/pete/Movies')}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Sao chép đường dẫn"
                >
                  {copiedText === '/home/pete/Movies' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Một đường dẫn bắt đầu bằng dấu{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  /
                </code>{' '}
                được gọi là <strong>đường dẫn tuyệt đối (absolute path)</strong> vì nó luôn bắt đầu
                từ thư mục gốc (root directory). Một đường dẫn như{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  Movies
                </code>{' '}
                được gọi là <strong>đường dẫn tương đối (relative path)</strong> vì nó phụ thuộc vào
                vị trí hiện tại của bạn.
              </p>

              {!showAllSteps && currentStep === 2 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Làm câu hỏi tương tác 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 3: Interactive Question 2 (Page 3) */}
          {isStepVisible(3) && (
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
                isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3
                  className={`font-semibold text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Điều gì làm cho{' '}
                  <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    /home/pete/Movies
                  </code>{' '}
                  trở thành một đường dẫn tuyệt đối (absolute path)?
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    text: 'Nó chứa nhiều tên thư mục được phân tách bởi dấu /. (It contains several directory names separated by /.)',
                    isCorrect: false,
                  },
                  {
                    text: 'Nó kết thúc tại một thư mục tên là Movies. (It ends at a directory named Movies.)',
                    isCorrect: false,
                  },
                  {
                    text: 'Nó bắt đầu từ thư mục gốc với dấu / ở đầu tiên. (It starts at root with a leading /.)',
                    isCorrect: true,
                  },
                ].map((opt, idx) => {
                  const isSelected = selectedAnswers.q2 === idx;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showIncorrect = isSelected && !opt.isCorrect;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption('q2', idx, 2)}
                      className={`group flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        showCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : showIncorrect
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : isDark
                          ? 'bg-[#151b2c] border-slate-800/80 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showIncorrect
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : isDark
                            ? 'border-slate-600 group-hover:border-slate-400'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedAnswers.q2 === 2 && (
                <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Chính xác! Mọi đường dẫn tuyệt đối đều bắt đầu bằng dấu gạch chéo{' '}
                    <code className="font-mono">/</code> đại diện cho thư mục gốc.
                  </span>
                </div>
              )}
              {selectedAnswers.q2 !== null && selectedAnswers.q2 !== 2 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>
                    Chưa đúng. Đường dẫn tương đối cũng có thể có dấu <code className="font-mono">/</code>{' '}
                    ở giữa (như <code className="font-mono">pete/Movies</code>). Điểm quyết định
                    đường dẫn tuyệt đối là dấu <code className="font-mono">/</code> ở ngay đầu.
                  </span>
                </div>
              )}

              {!showAllSteps && currentStep === 3 && selectedAnswers.q2 === 2 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Tiếp tục bài học</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: What is the Full Form of PWD in Linux? & Question 3 (Page 3) */}
          {isStepVisible(4) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                What is the Full Form of PWD in Linux? (Tên đầy đủ của lệnh PWD)
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Tên viết tắt đầy đủ của{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pwd
                </code>{' '}
                là <strong>&quot;print working directory&quot;</strong> (in thư mục làm việc hiện
                tại). Thư mục làm việc (<em>working directory</em>) là thư mục nơi shell của bạn
                đang đứng hiện tại. Các câu lệnh sử dụng đường dẫn tương đối sẽ bắt đầu tính từ vị
                trí này.
              </p>

              {/* Interactive Question 3 */}
              <div
                className={`mt-4 rounded-2xl border p-5 sm:p-6 transition-all ${
                  isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    Từ viết tắt{' '}
                    <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                      pwd
                    </code>{' '}
                    có nghĩa là gì? (What does pwd stand for?)
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    { text: 'Print working directory', isCorrect: true },
                    { text: 'Present working directory', isCorrect: false },
                    { text: 'Print whole directory', isCorrect: false },
                  ].map((opt, idx) => {
                    const isSelected = selectedAnswers.q3 === idx;
                    const showCorrect = isSelected && opt.isCorrect;
                    const showIncorrect = isSelected && !opt.isCorrect;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption('q3', idx, 0)}
                        className={`group flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                          showCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                            : showIncorrect
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                            : isDark
                            ? 'bg-[#151b2c] border-slate-800/80 hover:border-slate-700 text-slate-300'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                            showCorrect
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : showIncorrect
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : isDark
                              ? 'border-slate-600 group-hover:border-slate-400'
                              : 'border-slate-300 group-hover:border-slate-400'
                          }`}
                        >
                          {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                          {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedAnswers.q3 === 0 && (
                  <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Chính xác! <code className="font-mono">pwd</code> là viết tắt của{' '}
                      <strong>Print working directory</strong>.
                    </span>
                  </div>
                )}
                {selectedAnswers.q3 !== null && selectedAnswers.q3 !== 0 && (
                  <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                    <X className="w-4 h-4" />
                    <span>
                      Chưa đúng. Chữ P trong <code className="font-mono">pwd</code> là{' '}
                      <strong>Print</strong> và W là <strong>Working</strong> (Print working
                      directory).
                    </span>
                  </div>
                )}

                {!showAllSteps && currentStep === 4 && selectedAnswers.q3 === 0 && (
                  <div className="flex justify-center pt-4 animate-fadeIn">
                    <button
                      onClick={advanceStep}
                      className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
                    >
                      <span>Tiếp tục bài học</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* STEP 5: Using the pwd Command (Page 3 & Page 4) */}
          {isStepVisible(5) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Using the pwd Command (Cách sử dụng lệnh pwd)
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Để tìm thư mục hiện tại của bạn, hãy gõ{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pwd
                </code>{' '}
                và nhấn Enter.
              </p>

              {/* Terminal snippet with live Run button */}
              <div
                className={`p-4 rounded-xl border font-mono text-xs sm:text-sm flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-slate-900 text-slate-100 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-emerald-400">$ pwd</div>
                  <div className="text-slate-400">/home/pete</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunInTerminal('pwd')}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 shadow-sm transition cursor-pointer"
                    title="Chạy lệnh pwd trong terminal CentOS 9"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Chạy lệnh</span>
                  </button>
                  <button
                    onClick={() => handleCopy('pwd')}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Sao chép câu lệnh"
                  >
                    {copiedText === 'pwd' ? (
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
                Kết quả trả về là một đường dẫn tuyệt đối. Trong ví dụ trên, shell hiện đang đứng ở
                thư mục cá nhân (home directory) của người dùng{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pete
                </code>
                .
              </p>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Kết quả thực tế có thể khác nhau trên hệ thống của bạn vì tên người dùng, thư mục
                home và vị trí hiện tại có thể khác nhau (ví dụ{' '}
                <code className="font-mono text-xs">/root</code> hoặc{' '}
                <code className="font-mono text-xs">/home/centos</code>). Lệnh{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pwd
                </code>{' '}
                chỉ in ra thông tin chứ <strong>không làm thay đổi</strong> thư mục làm việc của
                bạn. Ngược lại, lệnh{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  cd
                </code>{' '}
                mới làm thay đổi thư mục nơi shell đang đứng.
              </p>

              {!showAllSteps && currentStep === 5 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Làm câu hỏi tương tác 4</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 6: Interactive Question 4 (Page 4) */}
          {isStepVisible(6) && (
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
                isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3
                  className={`font-semibold text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Hành động nào giúp kiểm tra thư mục hiện tại của bạn mà không làm thay đổi nó?
                  (Which action checks your current directory without changing it?)
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    text: 'Chạy lệnh cd và đọc tên thư mục mà nó di chuyển tới. (Run cd and read the directory it moves to.)',
                    isCorrect: false,
                  },
                  {
                    text: 'Nhập /home/pete và sử dụng đường dẫn đó như một câu lệnh. (Enter /home/pete and use the path as a command.)',
                    isCorrect: false,
                  },
                  {
                    text: 'Chạy lệnh pwd và đọc đường dẫn tuyệt đối mà nó in ra. (Run pwd and read the absolute path it prints.)',
                    isCorrect: true,
                  },
                ].map((opt, idx) => {
                  const isSelected = selectedAnswers.q4 === idx;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showIncorrect = isSelected && !opt.isCorrect;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption('q4', idx, 2)}
                      className={`group flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        showCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : showIncorrect
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                          : isDark
                          ? 'bg-[#151b2c] border-slate-800/80 hover:border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showIncorrect
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : isDark
                            ? 'border-slate-600 group-hover:border-slate-400'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedAnswers.q4 === 2 && (
                <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Chính xác! <code className="font-mono">pwd</code> chỉ in ra đường dẫn tuyệt đối
                    của thư mục hiện tại và giữ nguyên vị trí của bạn.
                  </span>
                </div>
              )}
              {selectedAnswers.q4 !== null && selectedAnswers.q4 !== 2 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>
                    Chưa đúng. Lệnh <code className="font-mono">cd</code> dùng để thay đổi thư mục,
                    còn gõ trực tiếp đường dẫn sẽ báo lỗi &quot;Is a directory&quot;. Hãy dùng{' '}
                    <code className="font-mono">pwd</code>.
                  </span>
                </div>
              )}

              {!showAllSteps && currentStep === 6 && selectedAnswers.q4 === 2 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Xem ứng dụng thực tế</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Why pwd is Useful (Page 4 & Page 5) */}
          {isStepVisible(7) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Why pwd is Useful (Tại sao lệnh pwd lại hữu ích?)
              </h2>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Sử dụng{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  pwd
                </code>{' '}
                khi:
              </p>

              <ul
                className={`space-y-2.5 text-sm sm:text-base leading-relaxed pl-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>
                    Bạn đang làm theo hướng dẫn và cần xác nhận vị trí hiện tại của mình (
                    <em>You are following instructions and need to confirm your location</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>
                    Một câu lệnh bị thất bại vì đường dẫn tệp tin bị sai (
                    <em>A command failed because a file path was wrong</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>
                    Bạn đã di chuyển qua nhiều thư mục khác nhau và quên mất mình đang đứng ở đâu (
                    <em>You moved through several directories and lost track of where you are</em>).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>
                    Bạn muốn sao chép đường dẫn thư mục hiện tại để dán vào một câu lệnh khác (
                    <em>You want to copy the current directory path into another command</em>).
                  </span>
                </li>
              </ul>

              <p
                className={`text-sm sm:text-base leading-relaxed pt-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Ví dụ (For example):
              </p>

              {/* Example block from Page 5 */}
              <div
                className={`p-4 rounded-xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                  isDark
                    ? 'bg-[#121624] border-slate-800 text-slate-200'
                    : 'bg-slate-900 text-slate-100 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-emerald-400">$ pwd</div>
                  <div className="text-slate-400">/home/pete/projects</div>
                  <div className="text-emerald-400 pt-1">$ ls</div>
                  <div className="text-slate-300">app.py  README.md</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleRunInTerminal('cd /home/pete/projects\npwd\nls')
                    }
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 shadow-sm transition cursor-pointer"
                    title="Chạy ví dụ này trong terminal CentOS 9"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Chạy ví dụ</span>
                  </button>
                  <button
                    onClick={() => handleCopy('cd /home/pete/projects && pwd && ls')}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Sao chép lệnh"
                  >
                    {copiedText === 'cd /home/pete/projects && pwd && ls' ? (
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
                Điều này cho bạn biết rằng hai tệp tin{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  app.py
                </code>{' '}
                và{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  README.md
                </code>{' '}
                đang nằm bên trong thư mục{' '}
                <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">
                  /home/pete/projects
                </code>
                .
              </p>

              {!showAllSteps && currentStep === 7 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Mở Hands-on Labs thực hành</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 8: Hands-on Labs from Page 5 + Integrated LabEx #209734 Interactive Exercises */}
          {isStepVisible(8) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Hands-on Labs: Thực hành củng cố trên CentOS 9
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {completedLabTasksCount}/4 hoàn thành
                </span>
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Để củng cố kiến thức về điều hướng hệ thống tệp tin Linux và xác định vị trí hiện
                tại, hãy thực hành 3 bài Lab dưới đây trực tiếp trên kernel CentOS Stream 9:
              </p>

              {/* 1. LabEx 209734: Linux pwd Command: Directory Displaying */}
              <div
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDark
                    ? 'bg-[#111625] border-blue-500/30 shadow-lg shadow-blue-950/10'
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
              >
                <div
                  onClick={() => setExpandedLabEx(!expandedLabEx)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-600 text-white">
                        Lab 1 · LabEx #209734
                      </span>
                      <h3
                        className={`font-bold text-sm sm:text-base ${
                          isDark ? 'text-blue-400' : 'text-blue-700'
                        }`}
                      >
                        1. Linux pwd Command: Directory Displaying
                      </h3>
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Tổng quan chuyên sâu và thực hành thực tế lệnh{' '}
                      <code className="font-mono">pwd</code>, bao gồm tùy chọn đường dẫn Logic (
                      <code className="font-mono">pwd -L</code>), đường dẫn Vật lý phân giải
                      Symbolic Link (<code className="font-mono">pwd -P</code>) và biến{' '}
                      <code className="font-mono">$PWD</code>.
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${
                      expandedLabEx ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedLabEx && (
                  <div
                    className={`p-4 sm:p-5 border-t space-y-3 text-xs sm:text-sm ${
                      isDark ? 'border-slate-800 bg-[#0d121f]' : 'border-slate-100 bg-slate-50/70'
                    }`}
                  >
                    {/* Step 1 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labStep1Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labStep1Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              1
                            </span>
                          )}
                          <span>Bước 1: In thư mục làm việc hiện tại</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Chạy lệnh <code className="font-mono text-blue-400">pwd</code> để xác nhận
                          đường dẫn tuyệt đối hiện tại trên máy ảo.
                        </p>
                      </div>
                      <button
                        onClick={() => handleRunInTerminal('pwd')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Thực thi pwd</span>
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labStep2Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labStep2Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              2
                            </span>
                          )}
                          <span>Bước 2: Kiểm tra thư mục dự án /home/pete/projects</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Di chuyển đến <code className="font-mono text-blue-400">/home/pete/projects</code>,
                          chạy <code className="font-mono text-blue-400">pwd</code> và{' '}
                          <code className="font-mono text-blue-400">ls -l</code> để kiểm tra tệp tin.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRunInTerminal('cd /home/pete/projects\npwd\nls -l')
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Chạy thử</span>
                      </button>
                    </div>

                    {/* Step 3: Logical (-L) vs Physical (-P) */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labStep3Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labStep3Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              3
                            </span>
                          )}
                          <span>
                            Bước 3: Phân biệt Đường dẫn Logic (pwd -L) &amp; Vật lý (pwd -P)
                          </span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Thư mục <code className="font-mono text-blue-400">/tmp/mylogs</code> là một
                          Symbolic Link trỏ tới <code className="font-mono text-blue-400">/var/log</code>.
                          Khi đứng trong đó, <code className="font-mono text-emerald-400">pwd -L</code>{' '}
                          in ra <code className="font-mono">/tmp/mylogs</code>, còn{' '}
                          <code className="font-mono text-emerald-400">pwd -P</code> phân giải symlink
                          in ra đường dẫn thật <code className="font-mono">/var/log</code>.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRunInTerminal('cd /tmp/mylogs\npwd -L\npwd -P')
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>So sánh -L / -P</span>
                      </button>
                    </div>

                    {/* Step 4: Scripting with $(pwd) */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        labStep4Done
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : isDark
                          ? 'bg-[#13192b] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold">
                          {labStep4Done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                              4
                            </span>
                          )}
                          <span>Bước 4: Dùng $(pwd) và biến $PWD trong câu lệnh khác</span>
                        </div>
                        <p className={isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                          Chèn trực tiếp kết quả của <code className="font-mono text-blue-400">pwd</code>{' '}
                          vào câu lệnh <code className="font-mono text-blue-400">echo</code> bằng cú
                          pháp <code className="font-mono text-emerald-400">$(pwd)</code>.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleRunInTerminal('echo "Current working dir is: $(pwd)"')
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Chạy $(pwd)</span>
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
                    className={`font-bold text-sm sm:text-base ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    2. Linux Directory Navigation
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Kiểm tra kỹ năng dòng lệnh cơ bản bằng cách di chuyển qua nhiều thư mục khác
                    nhau (<code className="font-mono">/home/pete/Movies</code>,{' '}
                    <code className="font-mono">/etc/directory1</code>), củng cố hiểu biết về đường
                    dẫn và cấu trúc cây tệp tin.
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleRunInTerminal('cd /home/pete/Movies\npwd\ncd /etc/directory1\npwd\nls')
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

              {/* 3. Linux cd Command: Directory Changing */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#111625] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <h3
                    className={`font-bold text-sm sm:text-base ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    3. Linux cd Command: Directory Changing
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Học cách điều hướng hệ thống tệp tin hiệu quả bằng câu lệnh{' '}
                    <code className="font-mono">cd</code>, nắm vững các kỹ thuật chuyển đổi thư mục
                    và khám phá cấu trúc file.
                  </p>
                </div>
                <button
                  onClick={onNextLesson}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer ${
                    isDark
                      ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <span>Mở Bài 3: cd</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!showAllSteps && currentStep === 8 && (
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

          {/* STEP 9: Lesson Complete Card (Page 6) */}
          {isStepVisible(9) && (
            <section
              className={`rounded-3xl border p-8 text-center transition-all animate-fadeIn ${
                isFinished
                  ? isDark
                    ? 'bg-[#101726] border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                    : 'bg-white border-emerald-300 shadow-xl shadow-emerald-100/50'
                  : isDark
                  ? 'bg-[#101522] border-slate-800/80 opacity-90'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${
                  isFinished
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block mb-1">
                LESSON COMPLETE · HOÀN THÀNH BÀI HỌC
              </span>

              <h3
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                You finished pwd (Print Working Directory)
              </h3>

              <p
                className={`text-sm mt-2 max-w-md mx-auto leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Bây giờ bạn đã có thể sử dụng <code className="font-mono">pwd</code> để xác định vị
                trí hiện tại của mình trong hệ thống tệp tin Linux.
              </p>

              {/* 4 Summary Bullet Checkmarks matching Page 6 */}
              <div className="max-w-md mx-auto text-left mt-6 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Nhận biết thư mục gốc (<code className="font-mono">/</code>) của cây thư mục (
                    <em>Recognize the root of the directory tree</em>).
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Phân biệt đường dẫn tuyệt đối và đường dẫn tương đối (
                    <em>Distinguish an absolute path from a relative path</em>).
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Giải thích ý nghĩa của <code className="font-mono">pwd</code> và kết quả lệnh trả
                    về (<em>Explain what pwd means and what it reports</em>).
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Kiểm tra thư mục làm việc hiện tại mà không làm thay đổi vị trí (
                    <em>Check your working directory without changing it</em>).
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={onNextLesson}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <span>Bài học tiếp theo (Next Lesson)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetQuiz}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Học lại (Learn again)</span>
                </button>
              </div>
            </section>
          )}

          {/* Bottom Back Button */}
          <div className="text-center pt-4 pb-12">
            <button
              onClick={onBackToSyllabus}
              className={`text-xs font-medium px-4 py-2 rounded-lg border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Command Line (Quay lại Command Line)</span>
            </button>
          </div>
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
                Thử gõ: <code className="text-blue-400">pwd -P</code> hoặc{' '}
                <code className="text-blue-400">cd /home/pete/projects</code>
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
