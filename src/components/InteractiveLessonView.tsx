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
import type { LessonDocument, LessonStep } from '../types/lessonDoc';

interface InteractiveLessonViewProps {
  lessonDoc: LessonDocument;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToHome?: () => void;
  onBackToSyllabus: () => void;
  onNextLesson: () => void;
  onCompleteLesson: () => void;
  onSwitchToPracticeMode?: () => void;
  kernel: CentOSKernel;
  refreshKernel: () => void;
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  lessonDoc,
  theme,
  onToggleTheme,
  onBackToHome,
  onBackToSyllabus,
  onNextLesson,
  onCompleteLesson,
  onSwitchToPracticeMode,
  kernel,
  refreshKernel,
}) => {
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showTerminalSplit, setShowTerminalSplit] = useState<boolean>(false);
  const [pendingCommand, setPendingCommand] = useState<{ id: number; command: string } | null>(null);
  const [expandedHandsOn, setExpandedHandsOn] = useState<boolean>(true);

  const totalSteps = lessonDoc.steps.length;
  const quizSteps = lessonDoc.steps.filter((s) => s.type === 'quiz' && s.quiz);

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

  const handleSelectOption = (qKey: string, optIndex: number, correctIndex: number) => {
    const updated = { ...selectedAnswers, [qKey]: optIndex };
    setSelectedAnswers(updated);

    if (optIndex === correctIndex) {
      const allQuizzesPassed = quizSteps.every((s) => {
        if (!s.quiz) return true;
        const ans = s.quiz.id === qKey ? optIndex : updated[s.quiz.id];
        return ans === s.quiz.correctIndex;
      });

      if (allQuizzesPassed && quizSteps.length > 0) {
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
    setSelectedAnswers({});
    setCurrentStep(0);
    setShowAllSteps(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hist = kernel.history.map((h) => h.trim().toLowerCase());

  const readingProgress = Math.min(
    100,
    Math.round(((currentStep + 1) / Math.max(1, totalSteps)) * 100)
  );

  const isStepVisible = (stepIndex: number) => showAllSteps || currentStep >= stepIndex;

  // Render text with inline code blocks and '/' framed as badge
  const renderFormattedText = (text?: string): React.ReactNode => {
    if (!text) return null;

    // Matches `code` backtick blocks, or '/' in single quotes, double quotes, or standalone slashes in context
    const regex = /(`[^`]+`|'\/+'|"\/+")/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        const codeContent = part.slice(1, -1);
        return (
          <code
            key={index}
            className={`px-2 py-0.5 mx-0.5 rounded-md border font-mono text-xs sm:text-[13px] inline-block font-medium ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            {codeContent}
          </code>
        );
      }

      if (part === "'/'" || part === '"/"') {
        return (
          <code
            key={index}
            className={`px-2 py-0.5 mx-0.5 rounded-md border font-mono text-xs sm:text-[13px] inline-block font-medium ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            /
          </code>
        );
      }

      return part;
    });
  };

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
            <span className="uppercase">{lessonDoc.title}</span>
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
              title="Mở giao diện Lab thực hành chấm điểm"
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

          {/* Progress Percentage */}
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
          {/* Lesson Header */}
          <div className="animate-fadeIn">
            <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase block">
              {lessonDoc.category.toUpperCase()} · LESSON {lessonDoc.lessonNumber}
            </span>
            <h1
              className={`text-3xl sm:text-4xl font-bold tracking-tight mt-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {lessonDoc.title}
            </h1>
            <p className={`text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lessonDoc.subtitle}
            </p>
          </div>

          {/* Dynamic Steps Rendering */}
          {lessonDoc.steps.map((step: LessonStep) => {
            if (!isStepVisible(step.stepIndex)) return null;

            if (step.type === 'content') {
              return (
                <section key={step.id} className="space-y-4 pt-2 animate-fadeIn">
                  {step.title && (
                    <h2
                      className={`text-2xl font-bold tracking-tight ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {renderFormattedText(step.title)}
                    </h2>
                  )}

                  {step.blocks?.map((block, bIdx) => {
                    if (block.type === 'paragraph') {
                      return (
                        <p
                          key={bIdx}
                          className={`text-sm sm:text-base leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {renderFormattedText(block.text)}
                        </p>
                      );
                    }

                    if (block.type === 'heading') {
                      return (
                        <h3
                          key={bIdx}
                          className={`text-xl font-bold tracking-tight pt-2 ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {renderFormattedText(block.text)}
                        </h3>
                      );
                    }

                    if (block.type === 'callout') {
                      return (
                        <div
                          key={bIdx}
                          className={`p-4 rounded-xl border text-sm sm:text-base font-medium leading-relaxed ${
                            isDark
                              ? 'bg-[#121727] border-slate-800 text-slate-200'
                              : 'bg-blue-50/60 border-blue-100 text-slate-800'
                          }`}
                        >
                          {renderFormattedText(block.text)}
                        </div>
                      );
                    }

                    if (block.type === 'list' && block.items) {
                      return (
                        <ul
                          key={bIdx}
                          className={`list-disc pl-5 space-y-2.5 text-sm sm:text-base leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {block.items.map((item, iIdx) => (
                            <li key={iIdx}>{renderFormattedText(item)}</li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === 'code' && block.codeBlock) {
                      const cb = block.codeBlock;
                      return (
                        <div
                          key={bIdx}
                          className={`p-4 sm:p-5 rounded-2xl border font-mono text-xs sm:text-sm flex items-center justify-between ${
                            isDark
                              ? 'bg-[#121624] border-slate-800 text-slate-200'
                              : 'bg-white border-slate-300 text-slate-800 shadow-xs'
                          }`}
                        >
                          <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                            {cb.code}
                          </pre>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {cb.runnableCommand && (
                              <button
                                onClick={() => handleRunInTerminal(cb.runnableCommand!)}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Chạy thử</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCopy(cb.code)}
                              className="p-1.5 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                              title="Sao chép"
                            >
                              {copiedText === cb.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}

                  {!showAllSteps && currentStep === step.stepIndex && (
                    <div className="flex justify-center pt-3 pb-2 animate-fadeIn">
                      <button
                        onClick={advanceStep}
                        className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
                      >
                        <span>Tiếp tục bước tiếp theo</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                      </button>
                    </div>
                  )}
                </section>
              );
            }

            if (step.type === 'quiz' && step.quiz) {
              const q = step.quiz;
              const isAnswered = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null;
              const isAnswerCorrect = selectedAnswers[q.id] === q.correctIndex;

              return (
                <div
                  key={step.id}
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
                      {renderFormattedText(q.question)}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                      const selected = selectedAnswers[q.id] === idx;
                      const isCorrect = idx === q.correctIndex;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(q.id, idx, q.correctIndex)}
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
                          {opt.isCode ? (
                            <code
                              className={`px-2 py-0.5 rounded-md border font-mono text-xs sm:text-[13px] font-medium ${
                                isDark
                                  ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                                  : 'bg-slate-100 border-slate-300 text-slate-900'
                              }`}
                            >
                              {opt.text}
                            </code>
                          ) : (
                            <span>{renderFormattedText(opt.text)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className={`mt-3.5 text-xs flex items-center gap-1.5 font-medium animate-fadeIn ${
                        isAnswerCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isAnswerCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>{renderFormattedText(q.explanation || 'Chính xác!')}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 flex-shrink-0" />
                          <span>Chưa chính xác. Hãy đọc kỹ gợi ý và thử lại nhé!</span>
                        </>
                      )}
                    </div>
                  )}

                  {isAnswerCorrect && !showAllSteps && currentStep === step.stepIndex && (
                    <div className="flex justify-center pt-5 animate-fadeIn">
                      <button
                        onClick={advanceStep}
                        className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                      >
                        <span>Tiếp tục phần tiếp theo</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (step.type === 'hands_on' && step.handsOn) {
              return (
                <section key={step.id} className="space-y-4 pt-2 animate-fadeIn">
                  {step.title && (
                    <h2
                      className={`text-2xl font-bold tracking-tight ${
                        isDark ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h2>
                  )}

                  {step.handsOn.map((section) => {
                    if (section.isPrimary && section.tasks) {
                      const completedTasks = section.tasks.filter((t) => {
                        if (!t.runnableCommand) return false;
                        const firstCmd = t.runnableCommand.split('\n')[0].trim().toLowerCase();
                        return hist.some((h) => h.includes(firstCmd));
                      }).length;

                      return (
                        <div
                          key={section.id}
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
                                  {section.title}
                                </h3>
                              </div>
                              <p
                                className={`text-xs sm:text-sm leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-600'
                                }`}
                              >
                                {section.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                                {completedTasks}/{section.tasks.length}
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
                                isDark
                                  ? 'border-slate-800/80 bg-[#0d1220]'
                                  : 'border-slate-100 bg-slate-50/70'
                              }`}
                            >
                              {section.tasks.map((task) => {
                                const isDone =
                                  task.runnableCommand &&
                                  hist.some((h) =>
                                    h.includes(
                                      task.runnableCommand!.split('\n')[0].trim().toLowerCase()
                                    )
                                  );

                                return (
                                  <div
                                    key={task.id}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                                      isDone
                                        ? 'bg-emerald-500/10 border-emerald-500/40'
                                        : isDark
                                        ? 'bg-[#13192b] border-slate-800'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 font-semibold">
                                        {isDone ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono">
                                            {task.stepNumber}
                                          </span>
                                        )}
                                        <span>{task.title}</span>
                                      </div>
                                      <p
                                        className={
                                          isDark ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'
                                        }
                                      >
                                        {task.description}
                                      </p>
                                    </div>
                                    {task.runnableCommand && (
                                      <button
                                        onClick={() => handleRunInTerminal(task.runnableCommand!)}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        <span>{task.buttonLabel || 'Thực hành'}</span>
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={section.id}
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
                            {section.title}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {section.description}
                          </p>
                        </div>
                        {section.runnableCommand && (
                          <button
                            onClick={() => handleRunInTerminal(section.runnableCommand!)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition cursor-pointer ${
                              isDark
                                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-blue-400'
                                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-blue-700'
                            }`}
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>{section.buttonLabel || 'Thực hành'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {!showAllSteps && currentStep === step.stepIndex && (
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
              );
            }

            if (step.type === 'summary') {
              return (
                <section
                  key={step.id}
                  className={`rounded-3xl border p-8 text-center transition-all animate-fadeIn ${
                    isDark
                      ? 'bg-[#101726] border-emerald-500/40 shadow-xl shadow-emerald-950/20'
                      : 'bg-white border-emerald-300 shadow-xl shadow-emerald-100/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 bg-emerald-500/20 text-emerald-400">
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
                    {step.title || `You finished ${lessonDoc.title}`}
                  </h3>

                  <p
                    className={`text-sm mt-2 max-w-md mx-auto leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Chúc mừng bạn đã hoàn thành bài học {lessonDoc.title}!
                  </p>

                  {step.takeaways && (
                    <div className="max-w-md mx-auto text-left mt-6 space-y-3 text-xs sm:text-sm">
                      {step.takeaways.map((t, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2.5 text-blue-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                            {renderFormattedText(t.text)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

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
                        isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      Back to {lessonDoc.category}
                    </button>
                  </div>
                </section>
              );
            }

            return null;
          })}
        </article>

        {/* Right Column: Live CentOS 9 Terminal */}
        {showTerminalSplit && (
          <aside className="lg:sticky lg:top-20 h-[680px] flex flex-col rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl bg-[#0f1422] animate-fadeIn">
            <div className="flex-1 min-h-0 h-full">
              <TerminalView
                kernel={kernel}
                theme={theme}
                onKernelUpdate={refreshKernel}
                pendingCommand={pendingCommand}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
