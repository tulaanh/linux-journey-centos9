import React, { useState, useEffect } from 'react';
import type { LabCheckResult } from '../types/linux';
import type { ChallengeDefinition } from '../services/challengesData';
import {
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Lightbulb,
  KeyRound,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Trophy,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengeGuidePanelProps {
  challenge: ChallengeDefinition;
  theme: 'dark' | 'light';
  onCheckChallenge: () => LabCheckResult[];
  onResetChallenge: () => void;
  onClosePanel?: () => void;
}

export const ChallengeGuidePanel: React.FC<ChallengeGuidePanelProps> = ({
  challenge,
  theme,
  onCheckChallenge,
  onResetChallenge,
  onClosePanel,
}) => {
  const isDark = theme === 'dark';

  // Stopwatch state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Grading states
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<LabCheckResult[] | null>(null);

  // Accordion states
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Stopwatch ticker
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining
      .toString()
      .padStart(2, '0')}`;
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const evaluation = onCheckChallenge();
      setResults(evaluation);
      setIsVerifying(false);

      const totalEarned = evaluation.reduce((a, b) => a + b.pointsEarned, 0);
      const totalMax = evaluation.reduce((a, b) => a + b.maxPoints, 0);

      if (totalEarned === totalMax && totalMax > 0) {
        setIsTimerRunning(false);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }, 400);
  };

  const totalEarned = results?.reduce((a, b) => a + b.pointsEarned, 0) ?? 0;
  const totalMax = results?.reduce((a, b) => a + b.maxPoints, 0) ?? challenge.xp;
  const isPassed = results !== null && totalEarned === totalMax && totalMax > 0;

  return (
    <aside className="w-full h-full flex flex-col justify-between select-none font-sans text-slate-200">
      {/* 1. Main Challenge Card */}
      <div
        className={`relative flex-1 flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#141824] border-[#293245] shadow-[0_12px_40px_rgba(0,0,0,0.65)]'
            : 'bg-white border-slate-200 shadow-xl text-slate-800'
        }`}
      >
        {/* Top Drag Handle Bar */}
        <div className="w-full pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#343e56] hover:bg-[#434f6d] transition-colors" />
        </div>

        {/* Challenge Header Bar */}
        <div className="px-5 py-3 border-b border-[#252c3e] flex items-center justify-between gap-3">
          {/* Badge & Title */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              CHALLENGE
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>+{challenge.xp} XP</span>
            </div>
          </div>

          {/* Right Action Icons: Timer & Reset & Close */}
          <div className="flex items-center gap-2">
            {/* Live Stopwatch */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${
                isDark
                  ? 'bg-[#1b2234] text-slate-300 border border-[#2b3550]'
                  : 'bg-slate-100 text-slate-700'
              }`}
              title="Thời gian làm bài thử thách"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            {/* Reset Challenge */}
            <button
              onClick={() => {
                if (window.confirm('Khôi phục lại hiện trạng ban đầu của thử thách?')) {
                  onResetChallenge();
                  setResults(null);
                  setSecondsElapsed(0);
                  setIsTimerRunning(true);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#252d40] transition-colors cursor-pointer"
              title="Đặt lại bài thử thách"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            {onClosePanel && (
              <button
                onClick={onClosePanel}
                className="w-6 h-6 rounded-full bg-[#242b3c] hover:bg-[#333d54] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Thu gọn bảng"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Challenge Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 select-text">
          {/* Challenge Title */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-rose-400 uppercase">
              {challenge.category} • {challenge.difficulty}
            </div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">
              {challenge.title}
            </h2>
          </div>

          {/* Incident Scenario Box */}
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/15 text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 text-xs uppercase tracking-wider">
              <span>🚨 Bối cảnh sự cố (Scenario)</span>
            </div>
            <p className="whitespace-pre-line text-slate-300 text-xs sm:text-sm">
              {challenge.scenario}
            </p>
          </div>

          {/* Target Objectives (Tiêu chí nghiệm thu) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                🎯 Mục tiêu nghiệm thu (Acceptance Criteria)
              </span>
              {results && (
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {totalEarned}/{totalMax} Điểm
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {challenge.tasks.map((task, idx) => {
                const res = results?.find((r) => r.id === task.id);
                const hasEvaluated = res !== undefined;
                const passed = res?.passed ?? false;

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasEvaluated
                        ? passed
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-rose-950/20 border-rose-500/40'
                        : isDark
                        ? 'bg-[#181e2e] border-[#263147]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {hasEvaluated ? (
                          passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-semibold ${
                              hasEvaluated
                                ? passed
                                  ? 'text-emerald-300'
                                  : 'text-rose-300'
                                : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[11px] font-mono font-medium text-slate-400 shrink-0">
                            +{task.points} pts
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Evaluation Message */}
                        {hasEvaluated && res.message && (
                          <div
                            className={`mt-2 text-[11px] p-2 rounded-lg border leading-relaxed ${
                              passed
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                            }`}
                          >
                            {res.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Banner if all passed */}
          {isPassed && (
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 text-center space-y-2 animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-base font-bold text-emerald-400">
                <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>XUẤT SẮC! BẠN ĐÃ VƯỢT QUA THỬ THÁCH!</span>
              </div>
              <p className="text-xs text-emerald-300">
                Hệ thống đã xác thực tất cả tiêu chuẩn nghiệm thu. Bạn nhận được +{challenge.xp} XP và hoàn thành trong {formatTime(secondsElapsed)}.
              </p>
            </div>
          )}

          {/* Accordion: Emergency Hints */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="rounded-xl border border-[#263147] bg-[#161c2b] overflow-hidden">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Cần trợ giúp? (Xem gợi ý giải quyết)</span>
                </div>
                {showHints ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {showHints && (
                <div className="px-4 pb-3 pt-1 border-t border-[#222b3e] text-xs text-slate-300 space-y-2">
                  {challenge.hints.map((hint, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span className="leading-relaxed">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Accordion: Reference Solution */}
          {challenge.referenceCommands && challenge.referenceCommands.length > 0 && (
            <div className="rounded-xl border border-[#263147] bg-[#161c2b] overflow-hidden">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-sky-300 hover:text-sky-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span>Lời giải tham khảo (Reference Commands)</span>
                </div>
                {showSolution ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {showSolution && (
                <div className="px-4 pb-3 pt-1 border-t border-[#222b3e] space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Đối chiếu các câu lệnh dưới đây nếu bạn muốn tham khảo cách giải chuẩn:
                  </p>
                  <div className="bg-[#0c0f17] p-3 rounded-lg border border-[#263147] font-mono text-xs text-sky-300 space-y-1">
                    {challenge.referenceCommands.map((cmd, cIdx) => (
                      <div key={cIdx} className="leading-relaxed">
                        $ {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Verify Bar */}
        <div className="p-4 border-t border-[#242b3d] bg-[#121623]/95 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Thử thách đã hoàn thành
              </span>
            ) : (
              <span>Thực hiện lệnh trong terminal rồi nhấn Kiểm tra</span>
            )}
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isPassed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98]'
            } disabled:opacity-60`}
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang chấm điểm...</span>
              </>
            ) : isPassed ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Kiểm tra lại</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-white" />
                <span>Xác thực giải pháp (Verify)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Bottom Dock Utilities */}
      <div className="flex items-center justify-between px-2 pt-2.5 text-xs text-slate-400">
        <button
          onClick={() =>
            alert(
              'Gợi ý: Hãy đọc kỹ yêu cầu trong bảng bên phải, thực hiện các lệnh Linux trong máy ảo CentOS 9 bên trái, sau đó nhấn nút "Xác thực giải pháp (Verify)" để chấm điểm tự động.'
            )
          }
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <span className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] font-bold">
            ?
          </span>
          <span>Cách làm thử thách</span>
        </button>

        <button
          onClick={() =>
            alert('Cảm ơn bạn đã phản hồi! Tính năng ghi nhận góp ý đang hoạt động.')
          }
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <span>💬 Góp ý</span>
        </button>
      </div>
    </aside>
  );
};
