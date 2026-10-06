import React, { useState, useMemo } from 'react';
import type { LabDefinition, LabCheckResult } from '../types/linux';
import type { LessonDocument, LessonContentBlock, LessonSummaryTakeaway } from '../types/lessonDoc';
import {
  List,
  Sparkles,
  CornerDownLeft,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  XCircle,
  X,
  RotateCcw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LabExStepGuideProps {
  lessonDoc?: LessonDocument;
  labDef: LabDefinition;
  theme: 'dark' | 'light';
  onRunCommand: (cmd: string) => void;
  onCheckLab: () => LabCheckResult[];
  onClosePanel?: () => void;
  onResetLab?: () => void;
}

// Normalized Step format representing ONE task/question at a time
interface NormalizedStep {
  id: string;
  index: number;
  badge: string;
  title: string;
  description: string;
  blocks?: LessonContentBlock[];
  takeaways?: LessonSummaryTakeaway[];
  codeSnippet?: {
    language: string;
    code: string;
    runnableCommand?: string;
  };
  explanation?: string;
  quiz?: {
    id: string;
    question: string;
    options: { text: string; isCode?: boolean }[];
    correctIndex: number;
    explanation?: string;
  };
  callout?: {
    variant: 'info' | 'tip' | 'warning';
    text: string;
  };
  isFinalEvaluation?: boolean;
}

export const LabExStepGuide: React.FC<LabExStepGuideProps> = ({
  lessonDoc,
  labDef,
  theme,
  onRunCommand,
  onCheckLab,
  onClosePanel,
  onResetLab,
}) => {
  const isDark = theme === 'dark';

  // 1. Build unified normalized steps
  const steps: NormalizedStep[] = useMemo(() => {
    if (lessonDoc && lessonDoc.steps && lessonDoc.steps.length > 0) {
      return lessonDoc.steps.map((s, idx) => {
        let codeSnippet: NormalizedStep['codeSnippet'] = undefined;
        let explanation: string | undefined = undefined;
        let callout: NormalizedStep['callout'] = undefined;
        let mainDesc = '';

        if (s.blocks) {
          for (const b of s.blocks) {
            if (b.type === 'paragraph' && b.text) {
              mainDesc += (mainDesc ? '\n\n' : '') + b.text;
            } else if (b.type === 'code' && b.codeBlock) {
              if (!codeSnippet) {
                codeSnippet = {
                  language: b.codeBlock.language || (b.codeBlock.type === 'command' ? 'bash' : 'plaintext'),
                  code: b.codeBlock.code,
                  runnableCommand: b.codeBlock.runnableCommand,
                };
              }
            } else if (b.type === 'callout' && b.text) {
              callout = {
                variant: b.variant || 'info',
                text: b.text,
              };
            } else if (b.type === 'list' && b.items) {
              mainDesc += (mainDesc ? '\n\n' : '') + b.items.map(it => `• ${it}`).join('\n');
            }
          }
        }

        if (s.handsOn && s.handsOn.length > 0) {
          const firstLab = s.handsOn[0];
          if (firstLab.tasks && firstLab.tasks.length > 0) {
            const firstTask = firstLab.tasks[0];
            mainDesc = firstTask.description;
            codeSnippet = {
              language: 'bash',
              code: firstTask.runnableCommand || '',
              runnableCommand: firstTask.runnableCommand,
            };
          }
        }

        // Collect all runnable commands in this step for smart syntax analysis
        const allCmds: string[] = [];
        if (s.blocks) {
          s.blocks.forEach(b => {
            if (b.type === 'code' && b.codeBlock?.runnableCommand) {
              allCmds.push(b.codeBlock.runnableCommand);
            }
          });
        }
        if (codeSnippet?.runnableCommand) allCmds.push(codeSnippet.runnableCommand);
        const joinedCmds = allCmds.join(' ');

        // Build automatic syntax explanation for Linux commands
        if (joinedCmds.includes('sleep') && joinedCmds.includes('&')) {
          explanation = `Ký tự '&' đặt ở cuối câu lệnh chỉ thị cho Shell thực thi tiến trình trong chế độ chạy ngầm (background mode). Shell sẽ giải phóng dấu nhắc terminal để bạn tiếp tục nhập lệnh khác và trả về [Job_ID] PID (ví dụ [1] 23885). Lệnh 'jobs' liệt kê các tiến trình nền đang hoạt động trong phiên làm việc.`;
        } else if (joinedCmds.includes('ps aux') || joinedCmds.includes('ps -ef') || joinedCmds.includes('ps -o')) {
          explanation = `Phân biệt cú pháp lệnh ps:\n• 'ps aux' (BSD style): 'a' (tất cả người dùng), 'u' (chi tiết %CPU, %MEM), 'x' (tiến trình nền không có terminal TTY).\n• 'ps -ef' (POSIX/UNIX style): '-e' (mọi tiến trình), '-f' (hiển thị đầy đủ gồm cột PPID - Parent PID).\n• 'ps -o pid,ni,pri,cmd -p <PID>': Xuất theo cột tùy biến gồm Nice value và Priority.`;
        } else if (joinedCmds.includes('top')) {
          explanation = `Tiện ích 'top' giám sát tài nguyên tương tác thời gian thực:\n• Phím 'M': Sắp xếp danh sách tiến trình theo mức tiêu thụ RAM (%MEM).\n• Phím 'P': Sắp xếp danh sách tiến trình theo mức tiêu thụ CPU (%CPU).\n• Phím 'q': Thoát khỏi tiện ích top an toàn.`;
        } else if (joinedCmds.includes('fg') || joinedCmds.includes('bg')) {
          explanation = `Quản lý tác vụ Shell (Job Control):\n• Ctrl+Z: Gửi tín hiệu SIGTSTP tạm dừng tiến trình foreground và chuyển vào nền ở trạng thái Stopped.\n• 'bg %<job_id>': Gửi tín hiệu SIGCONT đánh thức tiến trình chạy tiếp trong background.\n• 'fg %<job_id>': Đưa tiến trình nền trở lại tương tác trực tiếp ở tiền cảnh (Foreground).`;
        } else if (joinedCmds.includes('renice')) {
          explanation = `Lệnh 'renice -n <giá_trị> -p <PID>': Điều chỉnh mức độ ưu tiên lập lịch CPU (Niceness).\n• Thang đo Niceness: Từ -20 (ưu tiên cao nhất) đến +19 (ưu tiên thấp nhất, nhường CPU).\n• Người dùng thông thường chỉ được phép tăng giá trị nice (nhường quyền CPU), chỉ có quyền root/sudo mới được giảm nice (tăng ưu tiên).`;
        } else if (joinedCmds.includes('kill')) {
          explanation = `Lệnh 'kill': Gửi tín hiệu điều khiển tới tiến trình.\n• 'kill %<job_id>' hoặc 'kill <PID>': Mặc định gửi tín hiệu SIGTERM (15), cho phép tiến trình dọn dẹp tài nguyên và kết thúc an toàn.\n• 'kill -9 <PID>' (SIGKILL): Buộc kernel chấm dứt tiến trình ngay lập tức, không thể bị chặn hoặc bỏ qua.`;
        } else if (joinedCmds.includes('>>')) {
          explanation = `Toán tử >> (Append Output): Ghi thêm dữ liệu vào cuối tệp chỉ định mà không xóa bỏ nội dung đã có. An toàn khi cập nhật file log hoặc bổ sung thông tin.`;
        } else if (joinedCmds.includes('2>')) {
          explanation = `Toán tử 2> (Redirect Standard Error): Chuyển hướng luồng lỗi (File Descriptor 2) vào tệp lưu trữ riêng, giúp tách biệt các thông báo sự cố khỏi màn hình hoặc kết quả thành công.`;
        } else if (joinedCmds.includes('&>')) {
          explanation = `Toán tử &> (Combined Redirection): Chuyển hướng đồng thời cả Standard Output (FD 1) và Standard Error (FD 2) vào chung một tệp log duy nhất.`;
        } else if (joinedCmds.includes('|') && joinedCmds.includes('tee')) {
          explanation = `Lệnh tee (T-Splitter): Vừa in kết quả ra màn hình terminal để người học theo dõi trực tiếp, vừa nhân đôi luồng dữ liệu để ghi vào tệp tin.`;
        } else if (joinedCmds.includes('<')) {
          explanation = `Toán tử < (Redirect Standard Input): Đưa nội dung của một tệp tin vào làm dữ liệu đầu vào cho lệnh thay vì chờ nhập từ bàn phím.`;
        } else if (joinedCmds.includes('>')) {
          explanation = `Toán tử > (Redirect Standard Output): Tạo tệp mới hoặc xóa trắng (ghi đè) toàn bộ tệp cũ để lưu kết quả xuất chuẩn của lệnh.`;
        }

        return {
          id: s.id,
          index: idx,
          badge: `Step ${idx + 1}/${lessonDoc.steps.length}`,
          title: s.title || `Bước ${idx + 1}`,
          description: mainDesc || lessonDoc.subtitle,
          blocks: s.blocks,
          takeaways: s.takeaways,
          codeSnippet,
          explanation,
          quiz: s.quiz,
          callout,
          isFinalEvaluation: idx === lessonDoc.steps.length - 1,
        };
      });
    }

    // Fallback: Synthesize steps directly from labDef tasks & checks
    const synthesized: NormalizedStep[] = labDef.tasks.map((taskText, idx) => {
      const hintCmd = labDef.hints && labDef.hints[idx] ? labDef.hints[idx].replace(/^Chạy:\s*/i, '').trim() : undefined;
      const cleanCmd = hintCmd || (taskText.match(/`([^`]+)`/) ? taskText.match(/`([^`]+)`/)![1] : undefined);

      let explanation: string | undefined = undefined;
      if (cleanCmd?.includes('>>')) {
        explanation = `Toán tử >> (Append Output): Giữ nguyên dữ liệu cũ trong tệp và nối thêm dòng mới vào cuối tệp. Thường dùng để ghi nhật ký thời gian hoặc dữ liệu bổ sung.`;
      } else if (cleanCmd?.includes('2>')) {
        explanation = `Toán tử 2> (Redirect Error): Gom riêng các thông báo lỗi (stderr) vào tệp chỉ định để phân tích sự cố.`;
      } else if (cleanCmd?.includes('&>') || cleanCmd?.includes('2>&1')) {
        explanation = `Toán tử &>: Chuyển cả kết quả thành công (stdout) và lỗi (stderr) vào cùng một tệp log duy nhất.`;
      } else if (cleanCmd?.includes('tee')) {
        explanation = `Lệnh tee: Đóng vai trò như cút nối chữ T, vừa hiển thị output ra terminal vừa ghi vào tệp tin.`;
      } else if (cleanCmd?.includes('<')) {
        explanation = `Toán tử <: Đọc dữ liệu từ tệp tin làm đầu vào (stdin) cho câu lệnh.`;
      } else if (cleanCmd?.includes('>')) {
        explanation = `Toán tử >: Ghi đè kết quả của lệnh vào tệp tin. Toàn bộ nội dung cũ (nếu có) sẽ bị xóa sạch.`;
      }

      return {
        id: `task-step-${idx}`,
        index: idx,
        badge: `Task ${idx + 1}/${labDef.tasks.length}`,
        title: `Nhiệm vụ ${idx + 1}: ${taskText.split(':')[0].replace(/Task\s*\d+\s*:?\s*/i, '') || `Bước ${idx + 1}`}`,
        description: taskText,
        codeSnippet: cleanCmd
          ? {
              language: 'bash',
              code: cleanCmd,
              runnableCommand: cleanCmd,
            }
          : undefined,
        explanation,
        isFinalEvaluation: false,
      };
    });

    // Add final evaluation step
    synthesized.push({
      id: 'step-final-eval',
      index: synthesized.length,
      badge: `Final Check`,
      title: 'Hoàn thành bài thực hành & Chấm điểm',
      description: 'Bạn đã hoàn tất tất cả các yêu cầu của bài lab. Nhấn nút "Chấm điểm (Check Lab)" bên dưới để hệ thống kiểm tra và xác nhận điểm số của bạn.',
      isFinalEvaluation: true,
    });

    return synthesized;
  }, [lessonDoc, labDef]);

  // Current Step State (Displaying ONE step at a time)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showStepMenu, setShowStepMenu] = useState<boolean>(false);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [evaluationResults, setEvaluationResults] = useState<LabCheckResult[] | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex] || steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setIsExplainOpen(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setIsExplainOpen(false);
    }
  };

  const handleSelectStep = (index: number) => {
    setCurrentStepIndex(index);
    setShowStepMenu(false);
    setIsExplainOpen(false);
  };

  const handleCopy = (text: string, id: string = 'default') => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRun = (cmd: string) => {
    onRunCommand(cmd);
  };

  const handleGrade = () => {
    setIsGrading(true);
    setTimeout(() => {
      const results = onCheckLab();
      setEvaluationResults(results);
      setIsGrading(false);

      const totalEarned = results.reduce((a, b) => a + b.pointsEarned, 0);
      const totalMax = results.reduce((a, b) => a + b.maxPoints, 0);
      if (totalEarned === totalMax && totalMax > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 350);
  };

  // Inline code highlight formatter (highlights >>, >, 2>, &>, etc. in cyan)
  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(`[^`]+`|\b>>\b|\b>\b|\b2>\b|\b&>\b|\btee\b|\b<\b)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const inner = part.slice(1, -1);
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[12px] bg-sky-500/15 text-sky-300 border border-sky-500/30"
          >
            {inner}
          </code>
        );
      }
      if (['>>', '>', '2>', '&>', 'tee', '<'].includes(part)) {
        return (
          <span key={pIdx} className="font-mono font-bold text-sky-400 mx-0.5">
            {part}
          </span>
        );
      }
      return <span key={pIdx}>{part}</span>;
    });
  };

  const totalPoints = evaluationResults
    ? evaluationResults.reduce((a, b) => a + b.pointsEarned, 0)
    : 0;
  const maxPoints = evaluationResults
    ? evaluationResults.reduce((a, b) => a + b.maxPoints, 0)
    : 100;

  // Map current step to a corresponding verification check (Steps 1..6 in 8-step LabEx labs)
  const activeStepCheckIndex =
    lessonDoc && lessonDoc.steps.length === labDef.checks.length + 2
      ? currentStepIndex - 1
      : !currentStep.isFinalEvaluation && currentStepIndex < labDef.checks.length
      ? currentStepIndex
      : -1;
  const activeStepCheck =
    activeStepCheckIndex >= 0 && activeStepCheckIndex < labDef.checks.length
      ? labDef.checks[activeStepCheckIndex]
      : null;
  const activeStepEvalResult =
    activeStepCheck && evaluationResults
      ? evaluationResults.find((r) => r.id === activeStepCheck.id) || evaluationResults[activeStepCheckIndex]
      : null;

  return (
    <aside className="w-full h-full flex flex-col justify-between select-none font-sans text-slate-200">
      {/* 1. Main Floating Card (Matching LabEx UI 1:1) */}
      <div
        className={`relative flex-1 flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#151923] border-[#293245] shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
            : 'bg-white border-slate-200 shadow-xl text-slate-800'
        }`}
      >
        {/* Top Drag Handle Bar */}
        <div className="w-full pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#343e56] hover:bg-[#434f6d] transition-colors" />
        </div>

        {/* Header Bar: Menu Button + Segmented Progress Bar + Close Button */}
        <div className="px-4 py-2 border-b border-[#252c3e] flex items-center justify-between gap-2.5">
          {/* Menu / Step Directory Button */}
          <div className="relative">
            <button
              onClick={() => setShowStepMenu(!showStepMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252d40] transition-colors cursor-pointer"
              title="Danh sách mục lục các bước"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Step Selection Popover Menu */}
            {showStepMenu && (
              <div
                className={`absolute left-0 top-9 w-64 max-h-72 overflow-y-auto rounded-xl border p-2 z-50 shadow-2xl backdrop-blur-md ${
                  isDark
                    ? 'bg-[#121620]/95 border-[#2c364c] text-slate-200'
                    : 'bg-white/95 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">
                  Mục lục bài thực hành
                </div>
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStep(idx)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      idx === currentStepIndex
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="truncate pr-2">{s.title}</span>
                    <span className="text-[10px] opacity-70">
                      {idx + 1}/{steps.length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Segmented Progress Bar (Thin pill segments representing steps) */}
          <div className="flex items-center gap-1.5 flex-1 px-1">
            {steps.map((st, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              return (
                <div
                  key={st.id}
                  onClick={() => handleSelectStep(idx)}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
                      : isCompleted
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-[#293245] hover:bg-[#343e56]'
                  }`}
                  title={`Chuyển đến: ${st.title}`}
                />
              );
            })}
          </div>

          {/* Action buttons (Reset & Close) */}
          <div className="flex items-center gap-1.5">
            {onResetLab && (
              <button
                onClick={onResetLab}
                className="w-6 h-6 rounded-full bg-[#242b3c] hover:bg-[#333d54] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Đặt lại bài lab này"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            {onClosePanel && (
              <button
                onClick={onClosePanel}
                className="w-6 h-6 rounded-full bg-[#242b3c] hover:bg-[#333d54] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Thu gọn bảng hướng dẫn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Step Content (Displaying ONE step at a time) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 select-text">
          {/* Step Badge & Step Title */}
          <div>
            <span className="inline-block text-[11px] font-bold tracking-widest text-sky-400 uppercase">
              {currentStep.badge}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
              {currentStep.title}
            </h2>
          </div>

          {/* Step Content: Rich Blocks OR Single Description */}
          {currentStep.blocks && currentStep.blocks.length > 0 ? (
            <div className="space-y-3.5">
              {currentStep.blocks.map((block, bIdx) => {
                if (block.type === 'paragraph' && block.text) {
                  return (
                    <div
                      key={bIdx}
                      className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line"
                    >
                      {renderFormattedDescription(block.text)}
                    </div>
                  );
                }
                if (block.type === 'callout' && block.text) {
                  return (
                    <div
                      key={bIdx}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        block.variant === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : block.variant === 'tip'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                      }`}
                    >
                      {renderFormattedDescription(block.text)}
                    </div>
                  );
                }
                if (block.type === 'list' && block.items) {
                  return (
                    <ul key={bIdx} className="space-y-1.5 text-xs sm:text-sm text-slate-300 pl-1">
                      {block.items.map((item, itIdx) => (
                        <li key={itIdx} className="flex items-start gap-2">
                          <span className="text-sky-400 mt-0.5 font-bold">•</span>
                          <span>{renderFormattedDescription(item)}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'code' && block.codeBlock) {
                  const cb = block.codeBlock;
                  const snippetId = `snippet-${currentStepIndex}-${bIdx}`;
                  const isCopied = copiedCodeId === snippetId;
                  return (
                    <div
                      key={bIdx}
                      className="rounded-xl border border-[#242c3d] bg-[#0c0f17] overflow-hidden shadow-inner my-2"
                    >
                      {/* Header Bar: language label / caption + Run icon + Copy icon */}
                      <div className="px-3 py-1.5 bg-[#141824] border-b border-[#202738] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 lowercase">
                            {cb.language || (cb.type === 'command' ? 'bash' : 'plaintext')}
                          </span>
                          {cb.caption && (
                            <span className="text-[10px] text-slate-400 font-sans italic hidden sm:inline">
                              — {cb.caption}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {cb.runnableCommand && (
                            <button
                              onClick={() => handleRun(cb.runnableCommand!)}
                              className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-[#202738] transition-colors cursor-pointer flex items-center gap-1"
                              title="Nạp và chạy lệnh trong Terminal"
                            >
                              <CornerDownLeft className="w-3.5 h-3.5 text-sky-400" />
                              <span className="text-[10px] hidden sm:inline text-sky-400">Run</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleCopy(cb.code, snippetId)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202738] transition-colors cursor-pointer"
                            title="Sao chép câu lệnh"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Code content */}
                      <div className="p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                        {cb.code}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <>
              {/* Step Description / Main Instructions */}
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
                {renderFormattedDescription(currentStep.description)}
              </div>

              {/* Optional Callout Info / Warning */}
              {currentStep.callout && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    currentStep.callout.variant === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : currentStep.callout.variant === 'tip'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                  }`}
                >
                  {currentStep.callout.text}
                </div>
              )}

              {/* Code Snippet Box (Matching LabEx UI 1:1) */}
              {currentStep.codeSnippet && (
                <div className="rounded-xl border border-[#242c3d] bg-[#0c0f17] overflow-hidden shadow-inner">
                  {/* Header Bar: language label + Run icon + Copy icon */}
                  <div className="px-3 py-1.5 bg-[#141824] border-b border-[#202738] flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 lowercase">
                      {currentStep.codeSnippet.language}
                    </span>

                    <div className="flex items-center gap-1">
                      {currentStep.codeSnippet.runnableCommand && (
                        <button
                          onClick={() => handleRun(currentStep.codeSnippet!.runnableCommand!)}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-[#202738] transition-colors cursor-pointer flex items-center gap-1"
                          title="Nạp và chạy lệnh trong Terminal"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[10px] hidden sm:inline text-sky-400">Run</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(currentStep.codeSnippet!.code, 'fallback-snippet')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202738] transition-colors cursor-pointer"
                        title="Sao chép câu lệnh"
                      >
                        {copiedCodeId === 'fallback-snippet' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Code content */}
                  <div className="p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {currentStep.codeSnippet.code}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Key Takeaways Section (if present) */}
          {currentStep.takeaways && currentStep.takeaways.length > 0 && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Tổng kết kiến thức cốt lõi (Key Takeaways):
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {currentStep.takeaways.map((item, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{renderFormattedDescription(item.text)}</span>
                      {item.enText && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5">
                          {item.enText}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* "Explain Code" Button (Matching LabEx Sparkles Pill Button) */}
          {currentStep.explanation && (
            <div>
              <button
                onClick={() => setIsExplainOpen(!isExplainOpen)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#0e121a] hover:bg-[#1a2130] border border-[#2a3449] text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Explain Code</span>
              </button>

              {/* Expandable Explanation Drawer */}
              {isExplainOpen && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#0e121a] border border-sky-500/30 text-xs text-slate-300 leading-relaxed animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Phân tích cú pháp câu lệnh:</span>
                  </div>
                  <p>{currentStep.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Quiz (if this step is a Quiz) */}
          {currentStep.quiz && (
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2.5">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                Quiz củng cố kiến thức:
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-100">
                {currentStep.quiz.question}
              </p>

              <div className="space-y-1.5 pt-1">
                {currentStep.quiz.options.map((opt, oIdx) => {
                  const selected = selectedQuizAnswers[currentStep.quiz!.id];
                  const isChosen = selected === oIdx;
                  const isCorrect = oIdx === currentStep.quiz!.correctIndex;
                  const hasAnswered = selected !== undefined;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => {
                        setSelectedQuizAnswers(prev => ({ ...prev, [currentStep.quiz!.id]: oIdx }));
                        if (oIdx === currentStep.quiz!.correctIndex) {
                          confetti({ particleCount: 50, spread: 60 });
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                        hasAnswered && isCorrect
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : hasAnswered && isChosen && !isCorrect
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'bg-[#10141f] border-[#242c3d] hover:bg-[#1a2130] text-slate-300'
                      }`}
                    >
                      <span className={opt.isCode ? 'font-mono' : ''}>{opt.text}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {hasAnswered && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswers[currentStep.quiz.id] !== undefined && currentStep.quiz.explanation && (
                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                  {currentStep.quiz.explanation}
                </p>
              )}
            </div>
          )}

          {/* Per-Step Verification Card (for Hands-on Steps 1..6) */}
          {activeStepCheck && (
            <div
              className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                activeStepEvalResult
                  ? activeStepEvalResult.passed
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-rose-500/40 bg-rose-500/10'
                  : 'border-[#29344b] bg-[#10141f]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold text-[10px] uppercase">
                    Verification #{activeStepCheckIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {activeStepCheck.title}
                  </span>
                </div>
                <button
                  onClick={handleGrade}
                  disabled={isGrading}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isGrading ? 'Checking...' : 'Verify Step'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{activeStepCheck.description}</p>
              {activeStepEvalResult && (
                <div
                  className={`pt-1.5 border-t flex items-center justify-between text-xs font-medium ${
                    activeStepEvalResult.passed
                      ? 'border-emerald-500/30 text-emerald-300'
                      : 'border-rose-500/30 text-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {activeStepEvalResult.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    {activeStepEvalResult.message}
                  </span>
                  <span className="font-mono font-bold">
                    +{activeStepEvalResult.pointsEarned}/{activeStepEvalResult.maxPoints} pts
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Final Step: Detailed Evaluation Results */}
          {currentStep.isFinalEvaluation && evaluationResults && (
            <div className="space-y-2 pt-2 animate-fadeIn">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f1420] border border-blue-500/30">
                <span className="font-semibold text-xs text-slate-200">Tổng điểm đạt được:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {totalPoints} / {maxPoints} điểm
                </span>
              </div>

              <div className="space-y-1.5">
                {evaluationResults.map(r => (
                  <div
                    key={r.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      r.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-[11px] opacity-80">{r.message}</div>
                    </div>
                    <span className="font-mono font-bold text-xs pl-2">
                      +{r.pointsEarned}/{r.maxPoints}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Navigation buttons (Previous / Continue / Check Lab) */}
        <div className="px-5 py-3 border-t border-[#252c3e] bg-[#12151e] flex items-center justify-between gap-3">
          {/* Previous Button */}
          {!isFirstStep ? (
            <button
              onClick={handlePrevStep}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#202738] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {/* Action on Right: Continue OR Check Lab */}
          {!isLastStep ? (
            <button
              onClick={handleNextStep}
              className="bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGrade}
              disabled={isGrading}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>{isGrading ? 'Đang chấm điểm...' : 'Check Lab (Chấm điểm)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Bottom Dock Bar (Matching LabEx UI 1:1) */}
      <div className="mt-2.5 px-4 py-2 rounded-xl bg-[#0e121a] border border-[#242c3d] flex items-center justify-between text-xs shadow-lg">
        {/* Left: ? ask */}
        <button
          onClick={() => {
            if (labDef.hints && labDef.hints[currentStepIndex]) {
              alert(`Gợi ý cho bước này:\n${labDef.hints[currentStepIndex]}`);
            } else {
              alert('Gợi ý: Đọc kỹ phần thuyết minh và nhấn nút Run để chạy lệnh thử nghiệm trong terminal bên trái.');
            }
          }}
          className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Xem gợi ý hỗ trợ"
        >
          <span className="font-black text-rose-400">?</span>
          <span>ask</span>
        </button>

        {/* Right: feedback */}
        <button
          onClick={() => {
            alert('Cảm ơn bạn đã trải nghiệm phòng lab CentOS Stream 9!');
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Gửi phản hồi đóng góp ý kiến"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>feedback</span>
        </button>
      </div>
    </aside>
  );
};
