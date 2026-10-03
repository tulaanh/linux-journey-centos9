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
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CentOSKernel } from '../services/centosKernel';
import { TerminalView } from './TerminalView';

interface ShellLessonViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToSyllabus: () => void;
  onNextLesson: () => void;
  onCompleteLesson: () => void;
  kernel: CentOSKernel;
  refreshKernel: () => void;
  onOpenEditor: (path: string, content: string) => void;
}

export const ShellLessonView: React.FC<ShellLessonViewProps> = ({
  theme,
  onToggleTheme,
  onBackToSyllabus,
  onNextLesson,
  onCompleteLesson,
  kernel,
  refreshKernel,
  onOpenEditor,
}) => {
  const isDark = theme === 'dark';

  // Current progressive reading step:
  // 0: Header & Intro paragraph (Exactly like user screenshot)
  // 1: Terminal vs Shell explanation box & benefits
  // 2: Question 1: Terminal vs Shell
  // 3: Section: Interacting with Bash Shell & prompt box
  // 4: Question 2: Meaning of $ prompt
  // 5: Section: Command pattern (command options arguments) & Question 3
  // 6: Section: First command (echo) & examples
  // 7: Question 4: Quoting text with echo
  // 8: Section: Beginner tips (Enter, Up Arrow, case sensitivity, Ctrl-C)
  // 9: Completion card (Lesson Complete)
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
  const [showTerminalSplit, setShowTerminalSplit] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<{ id: number; command: string } | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleRunInTerminal = (cmd: string) => {
    setShowTerminalSplit(true);
    setPendingCommand({ id: Date.now(), command: cmd });
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

  const handleSelectOption = (qKey: string, optIndex: number, correctIndex: number) => {
    const updated = { ...selectedAnswers, [qKey]: optIndex };
    setSelectedAnswers(updated);

    if (optIndex === correctIndex) {
      const q1Ok = qKey === 'q1' ? true : updated.q1 === 0;
      const q2Ok = qKey === 'q2' ? true : updated.q2 === 1;
      const q3Ok = qKey === 'q3' ? true : updated.q3 === 2;
      const q4Ok = qKey === 'q4' ? true : updated.q4 === 0;

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

  // Calculate score & progress
  const answeredCount = [
    selectedAnswers.q1 === 0,
    selectedAnswers.q2 === 1,
    selectedAnswers.q3 === 2,
    selectedAnswers.q4 === 0,
  ].filter(Boolean).length;

  const readingProgress = Math.min(100, Math.round(((currentStep + 1) / 10) * 100));
  const isFinished = answeredCount === 4 && (currentStep >= 8 || showAllSteps);

  const isStepVisible = (stepIndex: number) => showAllSteps || currentStep >= stepIndex;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-[#0b0f19] text-slate-200' : 'bg-[#fafbfe] text-slate-800'
    }`}>
      {/* Top Sticky Navigation Bar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${
        isDark ? 'bg-[#0f1422]/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
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
            <span>THE SHELL</span>
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

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Toggle Step-by-Step vs Show All */}
          <button
            onClick={() => setShowAllSteps(!showAllSteps)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer hidden md:flex items-center gap-1.5 ${
              showAllSteps
                ? isDark ? 'border-slate-700 bg-slate-800 text-blue-400' : 'border-slate-300 bg-slate-100 text-blue-600'
                : isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-200 text-slate-600 hover:text-slate-900'
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
            <span className="hidden sm:inline">{showTerminalSplit ? 'Ẩn Terminal' : 'Mở Terminal CentOS 9'}</span>
            <span className="sm:hidden">Terminal</span>
          </button>

          {/* Progress Pill */}
          <div className="flex items-center gap-2">
            <div className={`w-14 sm:w-20 h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}>
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

      {/* Main Reading Container */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 ${
        showTerminalSplit ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : ''
      }`}>
        
        {/* Left Column: Progressive Reading & Quizzes */}
        <article className={`${showTerminalSplit ? 'max-w-none' : 'max-w-2xl mx-auto'} space-y-6 select-text`}>
          
          {/* Header Tag & Title */}
          <div className="animate-fadeIn">
            <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block">
              COMMAND LINE · BÀI HỌC 1
            </span>
            <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight mt-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              The Shell
            </h1>
            <p className={`text-base mt-2 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Tìm hiểu Linux shell là gì và cách các câu lệnh được thực thi trong hệ thống.
            </p>
          </div>

          {/* STEP 0: Exact match to user screenshot (What is the Linux Shell & Intro paragraph) */}
          {isStepVisible(0) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <h2 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                What is the Linux Shell
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Welcome to your Linux journey! The first step is understanding the Linux shell. A shell is a program that accepts commands you type, asks the operating system to run them, and then prints the result back to your terminal.
              </p>

              {/* Read more button for Step 0 */}
              {!showAllSteps && currentStep === 0 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Đọc tiếp</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 1: Terminal vs Shell details & benefits */}
          {isStepVisible(1) && (
            <section className="space-y-4 pt-2 animate-fadeIn">
              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Nếu bạn từng quen dùng giao diện đồ họa (GUI), bạn thường nhấp chuột vào các cửa sổ, menu và nút bấm. Nhưng trong dòng lệnh (command line), bạn sẽ gõ các hướng dẫn chính xác. Các ứng dụng có tên như <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">"Terminal"</code>, <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">"Console"</code>, hoặc <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">"Konsole"</code> thường mở ra một phiên làm việc của shell cho bạn.
              </p>

              <div className={`p-4 rounded-xl border text-sm sm:text-base font-medium leading-relaxed ${
                isDark ? 'bg-[#121727] border-slate-800 text-slate-200' : 'bg-blue-50/60 border-blue-100 text-slate-800'
              }`}>
                Terminal là cửa sổ hoặc ứng dụng mà bạn nhập chữ vào, còn shell là chương trình thực sự chạy bên trong cửa sổ đó.
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Shell vô cùng hữu ích vì nó có tốc độ phản hồi cực nhanh, khả năng viết kịch bản tự động hóa (scriptable) và có mặt trên hầu như tất cả các hệ thống Linux. Khi học được nhiều lệnh hơn, bạn có thể kết hợp chúng lại để kiểm tra tệp tin, quản lý thư mục, tìm kiếm văn bản, cài đặt phần mềm và tự động hóa những công việc lặp đi lặp lại.
              </p>

              {!showAllSteps && currentStep === 1 && (
                <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Làm câu hỏi tương tác 1</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: Interactive Question 1 */}
          {isStepVisible(2) && (
            <div className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
              isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className={`font-semibold text-sm sm:text-base ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  Câu nào sau đây mô tả chính xác mối quan hệ giữa terminal và shell?
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    text: 'Terminal cung cấp cửa sổ giao diện, còn shell chạy bên trong nó.',
                    isCorrect: true,
                  },
                  {
                    text: 'Terminal tiếp nhận các lệnh, còn shell chỉ hiển thị kết quả đầu ra.',
                    isCorrect: false,
                  },
                  {
                    text: 'Terminal và shell là hai tên gọi khác nhau của cùng một chương trình.',
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
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        showCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showIncorrect
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : isDark
                          ? 'border-slate-600 group-hover:border-slate-400'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
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
                  <span>Chính xác! Terminal là cửa sổ giao diện nhập liệu, còn shell là chương trình xử lý lệnh chạy bên trong.</span>
                </div>
              )}
              {selectedAnswers.q1 !== null && selectedAnswers.q1 !== 0 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>Chưa đúng. Hãy nhớ: terminal là cửa sổ đồ họa bên ngoài, còn shell là bộ máy thông dịch chạy bên trong.</span>
                </div>
              )}

              {/* Next step button after Question 1 */}
              {!showAllSteps && currentStep === 2 && selectedAnswers.q1 === 0 && (
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

          {/* STEP 3: Interacting with the Bash Shell */}
          {isStepVisible(3) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Tương tác với Bash Shell
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Trong khóa học này, chúng ta sẽ tập trung vào Bash, viết tắt của Bourne Again Shell. Bash là một trong những shell Linux thông dụng nhất và là nền tảng vững chắc ngay cả khi sau này bạn sử dụng <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">zsh</code>, <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">fish</code> hoặc các shell khác.
              </p>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Khi bạn mở một terminal, bạn sẽ được đón chào bởi dấu nhắc lệnh (shell prompt). Hình thức hiển thị của nó có thể thay đổi tùy cấu hình, nhưng thường cho biết username, host name và thư mục làm việc hiện tại.
              </p>

              {/* Prompt Code Block */}
              <div className={`p-4 rounded-xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                isDark ? 'bg-[#121624] border-slate-800 text-slate-200' : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}>
                <span>pete@icebox:/home/pete $</span>
                <button
                  onClick={() => handleCopy('pete@icebox:/home/pete $')}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Sao chép prompt"
                >
                  {copiedText === 'pete@icebox:/home/pete $' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Ký hiệu <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">$</code> biểu thị rằng shell đã sẵn sàng tiếp nhận lệnh từ một người dùng bình thường (normal user). Bạn không cần gõ ký hiệu này khi nhập lệnh; nó do shell tự hiển thị. Nếu bạn nhìn thấy ký hiệu <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">#</code> thay thế, điều đó có nghĩa là bạn đang làm việc với quyền root, quyền lực cao nhất và tiềm ẩn nhiều rủi ro hơn.
              </p>

              {!showAllSteps && currentStep === 3 && (
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

          {/* STEP 4: Interactive Question 2 */}
          {isStepVisible(4) && (
            <div className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
              isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className={`font-semibold text-sm sm:text-base ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  Ký hiệu $ ở cuối dấu nhắc lệnh ví dụ biểu thị điều gì?
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    text: 'Shell đang chạy với đặc quyền của người dùng root.',
                    isCorrect: false,
                  },
                  {
                    text: 'Shell đang chờ nhận lệnh từ một người dùng thông thường.',
                    isCorrect: true,
                  },
                  {
                    text: 'Lệnh tiếp theo bắt buộc phải bắt đầu bằng một dấu đô la ($).',
                    isCorrect: false,
                  },
                ].map((opt, idx) => {
                  const isSelected = selectedAnswers.q2 === idx;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showIncorrect = isSelected && !opt.isCorrect;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption('q2', idx, 1)}
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
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        showCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showIncorrect
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : isDark
                          ? 'border-slate-600 group-hover:border-slate-400'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
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

              {selectedAnswers.q2 === 1 && (
                <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chính xác! $ biểu thị người dùng bình thường. Người dùng quản trị root sẽ có dấu #.</span>
                </div>
              )}
              {selectedAnswers.q2 !== null && selectedAnswers.q2 !== 1 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>Chưa đúng. Ký hiệu # đại diện cho root; còn $ đại diện cho người dùng thông thường.</span>
                </div>
              )}

              {!showAllSteps && currentStep === 4 && selectedAnswers.q2 === 1 && (
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

          {/* STEP 5: Command pattern & Question 3 */}
          {isStepVisible(5) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Các câu lệnh thường tuân theo khuôn mẫu cú pháp sau:
              </p>

              <div className={`p-4 rounded-xl border font-mono text-xs sm:text-sm text-center font-bold tracking-wide ${
                isDark ? 'bg-[#121624] border-slate-800 text-blue-400' : 'bg-slate-100 border-slate-300 text-blue-700'
              }`}>
                command options arguments
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Ví dụ, trong <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echo Hello World</code>, <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echo</code> là câu lệnh (command) và <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">Hello World</code> là đoạn văn bản được truyền vào cho lệnh (arguments).
              </p>

              {/* Interactive Question 3 */}
              <div className={`mt-4 rounded-2xl border p-5 sm:p-6 transition-all ${
                isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className={`font-semibold text-sm sm:text-base ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    Trong <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echo Hello World</code>, phần nào là tên câu lệnh?
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    { text: 'Hello', isCorrect: false },
                    { text: 'World', isCorrect: false },
                    { text: 'echo', isCorrect: true },
                  ].map((opt, idx) => {
                    const isSelected = selectedAnswers.q3 === idx;
                    const showCorrect = isSelected && opt.isCorrect;
                    const showIncorrect = isSelected && !opt.isCorrect;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption('q3', idx, 2)}
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
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showIncorrect
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : isDark
                            ? 'border-slate-600 group-hover:border-slate-400'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}>
                          {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                          {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium font-mono">
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {selectedAnswers.q3 === 2 && (
                  <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chính xác! "echo" là từ đầu tiên chỉ định tên câu lệnh cần thực thi.</span>
                  </div>
                )}
                {selectedAnswers.q3 !== null && selectedAnswers.q3 !== 2 && (
                  <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                    <X className="w-4 h-4" />
                    <span>"Hello" và "World" là các tham số (arguments) truyền vào cho câu lệnh "echo".</span>
                  </div>
                )}

                {!showAllSteps && currentStep === 5 && selectedAnswers.q3 === 2 && (
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

          {/* STEP 6: First command (echo) & examples */}
          {isStepVisible(6) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Câu lệnh Linux đầu tiên của bạn
              </h2>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Hãy bắt đầu với một trong những câu lệnh Linux cơ bản nhất: <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echo</code>. Lệnh này sẽ hiển thị đoạn văn bản bạn nhập vào quay trở lại màn hình terminal.
              </p>

              {/* Terminal snippet with run button */}
              <div className={`p-4 rounded-xl border font-mono text-xs sm:text-sm flex items-center justify-between group ${
                isDark ? 'bg-[#121624] border-slate-800 text-slate-200' : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}>
                <div className="space-y-1">
                  <div className="text-emerald-400">$ echo Hello World</div>
                  <div className="text-slate-400">Hello World</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunInTerminal('echo Hello World')}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 shadow-sm transition cursor-pointer"
                    title="Chạy lệnh trong terminal CentOS 9"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>Chạy lệnh</span>
                  </button>
                  <button
                    onClick={() => handleCopy('echo Hello World')}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Sao chép câu lệnh"
                  >
                    {copiedText === 'echo Hello World' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Hãy thử thêm một vài ví dụ nữa:
              </p>

              {/* More examples block */}
              <div className={`p-4 rounded-xl border font-mono text-xs sm:text-sm space-y-3 ${
                isDark ? 'bg-[#121624] border-slate-800 text-slate-200' : 'bg-slate-900 text-slate-100 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-emerald-400">$ echo Linux is fun</div>
                    <div className="text-slate-400">Linux is fun</div>
                  </div>
                  <button
                    onClick={() => handleRunInTerminal('echo Linux is fun')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[11px] font-sans transition cursor-pointer"
                  >
                    Chạy
                  </button>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-emerald-400">$ echo "Hello from Bash"</div>
                    <div className="text-slate-400">Hello from Bash</div>
                  </div>
                  <button
                    onClick={() => handleRunInTerminal('echo "Hello from Bash"')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[11px] font-sans transition cursor-pointer"
                  >
                    Chạy
                  </button>
                </div>
              </div>

              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Dấu ngoặc kép rất hữu ích khi bạn muốn shell xử lý nhiều từ như một chuỗi văn bản duy nhất.
              </p>

              {!showAllSteps && currentStep === 6 && (
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

          {/* STEP 7: Interactive Question 4 */}
          {isStepVisible(7) && (
            <div className={`rounded-2xl border p-5 sm:p-6 transition-all animate-fadeIn ${
              isDark ? 'bg-[#111624] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className={`font-semibold text-sm sm:text-base ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  Câu lệnh nào giúp shell coi <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">Hello from Bash</code> như một chuỗi văn bản duy nhất trong ngoặc kép?
                </h3>
              </div>

              <div className="space-y-2.5">
                {[
                  { text: 'echo "Hello from Bash"', isCorrect: true },
                  { text: 'echo Hello from Bash', isCorrect: false },
                  { text: '"echo Hello from Bash"', isCorrect: false },
                ].map((opt, idx) => {
                  const isSelected = selectedAnswers.q4 === idx;
                  const showCorrect = isSelected && opt.isCorrect;
                  const showIncorrect = isSelected && !opt.isCorrect;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption('q4', idx, 0)}
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
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                        showCorrect
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showIncorrect
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : isDark
                          ? 'border-slate-600 group-hover:border-slate-400'
                          : 'border-slate-300 group-hover:border-slate-400'
                      }`}>
                        {showCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        {showIncorrect && <X className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-medium font-mono">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedAnswers.q4 === 0 && (
                <div className="mt-3.5 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chính xác! Đặt các tham số trong dấu ngoặc kép giúp giữ nguyên khoảng trắng và gộp thành một đối số duy nhất.</span>
                </div>
              )}
              {selectedAnswers.q4 !== null && selectedAnswers.q4 !== 0 && (
                <div className="mt-3.5 text-xs text-rose-400 flex items-center gap-1.5 font-medium animate-fadeIn">
                  <X className="w-4 h-4" />
                  <span>Dấu ngoặc kép cần bao quanh các từ tham số, chứ không phải bao quanh tên câu lệnh.</span>
                </div>
              )}

              {!showAllSteps && currentStep === 7 && selectedAnswers.q4 === 0 && (
                <div className="flex justify-center pt-4 animate-fadeIn">
                  <button
                    onClick={advanceStep}
                    className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all duration-200 cursor-pointer"
                  >
                    <span>Xem lời khuyên hữu ích</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Common Beginner Tips */}
          {isStepVisible(8) && (
            <section className="space-y-4 pt-4 border-t border-slate-800/40 animate-fadeIn">
              <h2 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                Lời khuyên hữu ích cho người mới bắt đầu
              </h2>

              <ul className={`space-y-2.5 text-sm sm:text-base leading-relaxed pl-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Nhấn phím <kbd className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-slate-800/50 border-slate-700 text-slate-300">Enter</kbd> để thực thi câu lệnh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Dùng phím mũi tên lên <kbd className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-slate-800/50 border-slate-700 text-slate-300">Up Arrow</kbd> để gọi lại câu lệnh trước đó mà bạn đã gõ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Các câu lệnh và tên tệp tin trong Linux có phân biệt chữ hoa / chữ thường (case-sensitive).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Khoảng trắng có ý nghĩa quan trọng: <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echo hello</code> và <code className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-blue-500/10 border-blue-500/20 text-blue-400">echohello</code> là hai lệnh hoàn toàn khác nhau.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Nếu một câu lệnh có vẻ bị treo, tổ hợp phím <kbd className="px-1.5 py-0.5 rounded text-xs font-mono font-medium border bg-slate-800/50 border-slate-700 text-slate-300">Ctrl-C</kbd> thường sẽ hủy và thoát khỏi lệnh đó.</span>
                </li>
              </ul>

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

          {/* STEP 9: Lesson Complete Card */}
          {isStepVisible(9) && (
            <section className={`rounded-3xl border p-8 text-center transition-all animate-fadeIn ${
              isFinished
                ? isDark 
                  ? 'bg-[#101726] border-emerald-500/40 shadow-xl shadow-emerald-950/20' 
                  : 'bg-white border-emerald-300 shadow-xl shadow-emerald-100/50'
                : isDark
                ? 'bg-[#101522] border-slate-800/80 opacity-90'
                : 'bg-white border-slate-200'
            }`}>
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors ${
                isFinished ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              }`}>
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block mb-1">
                HOÀN THÀNH BÀI HỌC
              </span>

              <h3 className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Bạn đã hoàn thành bài học The Shell
              </h3>

              <p className={`text-sm mt-2 max-w-md mx-auto leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Bây giờ bạn đã có thể giải thích vai trò của shell và tương tác với các dấu nhắc lệnh cơ bản.
              </p>

              <div className="max-w-xs mx-auto text-left mt-6 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Phân biệt giữa terminal và shell.
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Nhận biết dấu nhắc lệnh (command prompt).
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Thực thi câu lệnh đơn giản với echo.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={onNextLesson}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <span>Bài học tiếp theo</span>
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
                  <span>Học lại</span>
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
              <span>Quay lại Command Line</span>
            </button>
          </div>

        </article>

        {/* Right Column: Live CentOS 9 Terminal */}
        {showTerminalSplit && (
          <aside className="lg:sticky lg:top-20 h-[650px] flex flex-col rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl bg-[#0f1422] animate-fadeIn">
            <div className="px-4 py-2.5 border-b border-slate-800 bg-[#121727] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-emerald-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>CentOS Stream 9 (Interactive Shell)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans">
                Thử gõ: <code className="text-blue-400">echo "Hello World"</code>
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
