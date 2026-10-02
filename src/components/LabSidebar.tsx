import React, { useState } from 'react';
import type { LabDefinition, LabCheckResult } from '../types/linux';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Zap,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LabSidebarProps {
  labs: LabDefinition[];
  currentLab: LabDefinition;
  theme: 'dark' | 'light';
  onSelectLab: (lab: LabDefinition) => void;
  onResetLab: () => void;
  onEvaluateLab: () => LabCheckResult[];
  completedLabIds: number[];
}

export const LabSidebar: React.FC<LabSidebarProps> = ({
  labs,
  currentLab,
  theme,
  onSelectLab,
  onResetLab,
  onEvaluateLab,
  completedLabIds,
}) => {
  const isDark = theme === 'dark';
  const [results, setResults] = useState<LabCheckResult[] | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleGrade = () => {
    setIsGrading(true);
    setTimeout(() => {
      const evalResults = onEvaluateLab();
      setResults(evalResults);
      setIsGrading(false);

      const totalEarned = evalResults.reduce((acc, r) => acc + r.pointsEarned, 0);
      const totalMax = evalResults.reduce((acc, r) => acc + r.maxPoints, 0);

      if (totalEarned === totalMax && totalMax > 0) {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.65 },
        });
      }
    }, 300);
  };

  const handleLabChange = (lab: LabDefinition) => {
    setResults(null);
    setShowHints(false);
    onSelectLab(lab);
  };

  const currentIndex = labs.findIndex((l) => l.id === currentLab.id);
  const prevLab = currentIndex > 0 ? labs[currentIndex - 1] : null;
  const nextLab = currentIndex < labs.length - 1 ? labs[currentIndex + 1] : null;

  const totalPoints = results ? results.reduce((a, b) => a + b.pointsEarned, 0) : 0;
  const maxPossiblePoints = results ? results.reduce((a, b) => a + b.maxPoints, 0) : 100;
  const isPassedAll = results && totalPoints === maxPossiblePoints && maxPossiblePoints > 0;

  return (
    <div
      className={`flex flex-col h-full border-r overflow-hidden transition-colors ${
        isDark
          ? 'bg-[#0d1117] border-[#30363d] text-slate-200'
          : 'bg-[#f6f8fa] border-[#d0d7de] text-slate-800'
      }`}
    >
      {/* Top Header: Compact Selector */}
      <div
        className={`p-2.5 border-b flex items-center justify-between gap-1.5 ${
          isDark ? 'bg-[#12161f] border-[#30363d]' : 'bg-white border-[#d0d7de]'
        }`}
      >
        <select
          value={currentLab.id}
          onChange={(e) => {
            const selected = labs.find((l) => l.id === Number(e.target.value));
            if (selected) handleLabChange(selected);
          }}
          className={`flex-1 rounded px-2.5 py-1 text-xs font-medium truncate border focus:outline-none cursor-pointer ${
            isDark
              ? 'bg-[#1c2128] border-[#30363d] text-slate-200 focus:border-blue-500'
              : 'bg-slate-50 border-[#d0d7de] text-slate-900 focus:border-blue-600'
          }`}
        >
          {labs.map((l) => (
            <option key={l.id} value={l.id}>
              {completedLabIds.includes(l.id) ? '✓ ' : ''}#{l.id}: {l.title}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => prevLab && handleLabChange(prevLab)}
            disabled={!prevLab}
            className={`p-1 rounded border disabled:opacity-30 transition ${
              isDark
                ? 'bg-[#1c2128] border-[#30363d] hover:bg-slate-700 text-slate-300'
                : 'bg-white border-[#d0d7de] hover:bg-slate-100 text-slate-700'
            }`}
            title="Bài trước"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => nextLab && handleLabChange(nextLab)}
            disabled={!nextLab}
            className={`p-1 rounded border disabled:opacity-30 transition ${
              isDark
                ? 'bg-[#1c2128] border-[#30363d] hover:bg-slate-700 text-slate-300'
                : 'bg-white border-[#d0d7de] hover:bg-slate-100 text-slate-700'
            }`}
            title="Bài tiếp theo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                isDark
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              Lab {currentLab.id}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {currentLab.difficulty} • {currentLab.estimatedTime}
            </span>
          </div>
          <h1 className="text-sm font-semibold leading-snug">{currentLab.title}</h1>
        </div>

        {/* Short Scenario */}
        <p
          className={`p-2.5 rounded border text-[11.5px] leading-relaxed ${
            isDark
              ? 'bg-[#161b22] border-[#30363d] text-slate-300'
              : 'bg-white border-[#d0d7de] text-slate-700'
          }`}
        >
          {currentLab.scenario}
        </p>

        {/* Checklist with Integrated Evaluation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Tiêu chí chấm điểm:
            </span>
            {results && (
              <span
                className={`font-mono text-xs font-bold ${
                  isPassedAll ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {totalPoints}/{maxPossiblePoints}đ
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {currentLab.checks.map((check, idx) => {
              const res = results?.find((r) => r.id === check.id);
              const isPassed = res?.passed;
              const hasChecked = !!res;

              return (
                <div
                  key={check.id}
                  className={`p-2 rounded border transition-colors ${
                    hasChecked
                      ? isPassed
                        ? isDark
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                          : 'bg-emerald-50/70 border-emerald-300 text-slate-800'
                        : isDark
                        ? 'bg-rose-950/20 border-rose-800/40 text-slate-200'
                        : 'bg-rose-50/70 border-rose-300 text-slate-800'
                      : isDark
                      ? 'bg-[#161b22] border-[#30363d] text-slate-300'
                      : 'bg-white border-[#d0d7de] text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        {hasChecked ? (
                          isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )
                        ) : (
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[9px] ${
                              isDark
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{check.title}</div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {check.description}
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                      {hasChecked ? (
                        <span
                          className={
                            isPassed
                              ? 'text-emerald-500 font-bold'
                              : 'text-rose-500 font-bold'
                          }
                        >
                          {res.pointsEarned}/{check.points}đ
                        </span>
                      ) : (
                        `${check.points}đ`
                      )}
                    </span>
                  </div>

                  {/* Inline tip when failed */}
                  {hasChecked && !isPassed && (
                    <div
                      className={`mt-1.5 pt-1.5 border-t text-[11px] ${
                        isDark ? 'border-rose-900/40 text-rose-300' : 'border-rose-200 text-rose-800'
                      }`}
                    >
                      <div>{res.message}</div>
                      {check.hint && (
                        <div
                          className={`mt-1 font-mono text-[10px] p-1.5 rounded border ${
                            isDark
                              ? 'bg-[#0d1117] border-slate-800 text-amber-300'
                              : 'bg-white border-slate-200 text-amber-800'
                          }`}
                        >
                          Gợi ý: {check.hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hints Drawer */}
        <div className="pt-1">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1 text-[11.5px] text-slate-400 hover:text-slate-300 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Gợi ý lệnh</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showHints ? 'rotate-180' : ''}`}
            />
          </button>

          {showHints && (
            <div
              className={`mt-2 p-2 rounded border space-y-1.5 text-[11px] font-mono ${
                isDark
                  ? 'bg-[#161b22] border-[#30363d] text-slate-400'
                  : 'bg-white border-[#d0d7de] text-slate-600'
              }`}
            >
              {currentLab.usefulCommands.map((c, i) => (
                <div
                  key={i}
                  className={`p-1 rounded ${
                    isDark ? 'bg-[#0d1117]' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div
        className={`p-2.5 border-t flex items-center gap-2 ${
          isDark ? 'bg-[#12161f] border-[#30363d]' : 'bg-white border-[#d0d7de]'
        }`}
      >
        <button
          onClick={handleGrade}
          disabled={isGrading}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs transition disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${isGrading ? 'animate-spin' : ''}`} />
          <span>{isGrading ? 'Đang chấm...' : 'Chấm điểm'}</span>
        </button>

        <button
          onClick={onResetLab}
          className={`p-1.5 rounded border transition ${
            isDark
              ? 'bg-[#1c2128] border-[#30363d] hover:bg-slate-700 text-slate-300'
              : 'bg-slate-50 border-[#d0d7de] hover:bg-slate-100 text-slate-700'
          }`}
          title="Làm lại bài lab này"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
