import React, { useState, useMemo } from 'react';
import type { ChallengeDefinition } from '../services/challengesData';
import { LINUX_CHALLENGES } from '../services/challengesData';
import {
  FlaskConical,
  Search,
  Flame,
  Zap,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  ShieldAlert,
  FileCode,
  Activity,
  Users,
  HardDrive,
  KeyRound,
  Filter,
} from 'lucide-react';

interface ChallengesCatalogProps {
  completedChallengeIds: number[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectChallenge: (challenge: ChallengeDefinition) => void;
  onNavigateHome: () => void;
  onNavigateLearn: () => void;
  onOpenFileBrowser: () => void;
  onOpenGuide: () => void;
}

export const ChallengesCatalog: React.FC<ChallengesCatalogProps> = ({
  completedChallengeIds,
  theme,
  onSelectChallenge,
  onNavigateHome,
  onNavigateLearn,
  onOpenFileBrowser,
  onOpenGuide,
}) => {
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter challenges
  const filteredChallenges = useMemo(() => {
    return LINUX_CHALLENGES.filter((c) => {
      const matchSearch =
        searchQuery === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.referenceCommands.some((cmd) =>
          cmd.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchDifficulty =
        selectedDifficulty === 'all' || c.difficulty === selectedDifficulty;

      const matchCategory =
        selectedCategory === 'all' || c.category === selectedCategory;

      return matchSearch && matchDifficulty && matchCategory;
    });
  }, [searchQuery, selectedDifficulty, selectedCategory]);

  // Statistics
  const totalCount = LINUX_CHALLENGES.length;
  const completedCount = LINUX_CHALLENGES.filter((c) =>
    completedChallengeIds.includes(c.id)
  ).length;
  const totalXpEarned = LINUX_CHALLENGES.filter((c) =>
    completedChallengeIds.includes(c.id)
  ).reduce((acc, c) => acc + c.xp, 0);
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Icon selector per category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Permissions & Security':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Text Processing & Streams':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'Process & Storage Triage':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'User & Group Administration':
        return <Users className="w-4 h-4 text-sky-400" />;
      case 'I/O Streams & Backup':
        return <HardDrive className="w-4 h-4 text-purple-400" />;
      case 'Search & Security':
        return <KeyRound className="w-4 h-4 text-indigo-400" />;
      default:
        return <Flame className="w-4 h-4 text-rose-400" />;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Cơ bản':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Trung bình':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Nâng cao':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      className={`min-h-[100dvh] flex flex-col font-sans transition-colors duration-200 select-none ${
        isDark ? 'bg-[#0e1320] text-slate-100' : 'bg-[#f4f6fa] text-slate-900'
      }`}
    >
      {/* 1. Top Navbar Matching LabEx Screenshot 1:1 */}
      <header
        className={`h-14 px-4 sm:px-8 flex items-center justify-between border-b transition-colors ${
          isDark
            ? 'bg-[#0d1321] border-[#1e2638] text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          {/* Left: Brand Logo & Navigation Links */}
          <div className="flex items-center gap-7">
            {/* LabEx Brand */}
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 font-bold text-lg tracking-tight cursor-pointer focus:outline-none group"
            >
              <FlaskConical
                className={`w-5 h-5 transition-transform duration-200 group-hover:rotate-[-8deg] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                strokeWidth={2.2}
              />
              <span className={isDark ? 'text-white' : 'text-slate-900'}>LabEx</span>
            </button>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium">
              <button
                onClick={onNavigateLearn}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Learn
              </button>
              {/* Challenges Tab - ACTIVE */}
              <button
                onClick={() => {}}
                className="text-[#3b82f6] font-bold cursor-pointer relative py-1 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-0.5 after:bg-[#3b82f6]"
              >
                Challenges
              </button>
              <button
                onClick={onOpenGuide}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={onOpenFileBrowser}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={onNavigateHome}
                className={`transition-colors cursor-pointer ${
                  isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Linux Journey
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Secondary Sub-bar strip matching LabEx screenshot */}
      <div
        className={`h-6 w-full border-b transition-colors ${
          isDark
            ? 'bg-[#151c2c] border-[#1e273a]'
            : 'bg-slate-200/70 border-slate-300/60'
        }`}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-8 py-8 space-y-8 select-text">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#20293d]">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Flame className="w-3.5 h-3.5 fill-rose-400" />
              <span>Real-World Scenario Labs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Linux Hands-On Challenges
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Giải quyết các sự cố quản trị hệ thống thực tế trên CentOS Stream 9.
              Không có gợi ý từng lệnh từng bước — hãy tự tay chẩn đoán, sửa chữa và
              nhấn <strong className="text-rose-400">Verify</strong> để hệ thống tự động chấm điểm.
            </p>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-xl border border-[#242f47] bg-[#141b2a] text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-white">
                {totalCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Thử thách
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#242f47] bg-[#141b2a] text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-emerald-400">
                {completedCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Đã vượt qua
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#242f47] bg-[#141b2a] text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>{totalXpEarned}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Điểm XP
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#242f47] bg-[#141b2a] text-center min-w-[100px]">
              <div className="text-xl font-bold font-mono text-sky-400">
                {completionPercent}%
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Tỷ lệ hoàn thành
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài, công cụ (chmod, nginx, kill, tee, grep)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#263148] bg-[#141a29] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Difficulty & Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#141a29] p-1 rounded-xl border border-[#263148] text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Cơ bản', label: 'Cơ bản' },
                { id: 'Trung bình', label: 'Trung bình' },
                { id: 'Nâng cao', label: 'Nâng cao' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedDifficulty === diff.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((challenge) => {
            const isCompleted = completedChallengeIds.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                onClick={() => onSelectChallenge(challenge)}
                className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-2xl ${
                  isCompleted
                    ? 'bg-[#121b2b] border-emerald-500/40 hover:border-emerald-400'
                    : isDark
                    ? 'bg-[#141926] border-[#242e44] hover:border-blue-500/60 shadow-lg'
                    : 'bg-white border-slate-200 hover:border-blue-500 shadow-md'
                }`}
              >
                <div>
                  {/* Card Top: Badges & Rewards */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1e2638] text-slate-300 border border-[#2c364e]">
                        {getCategoryIcon(challenge.category)}
                        <span>{challenge.category}</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getDifficultyBadge(
                          challenge.difficulty
                        )}`}
                      >
                        {challenge.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{challenge.xp} XP</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {challenge.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {challenge.summary}
                  </p>

                  {/* Objectives summary preview */}
                  <div className="mt-4 pt-3 border-t border-[#222b3e] space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Tiêu chí nghiệm thu ({challenge.tasks.length} mục tiêu):
                    </span>
                    {challenge.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className="flex items-start gap-1.5 text-xs text-slate-300"
                      >
                        <span className="text-blue-400 font-bold">•</span>
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {challenge.tasks.length > 2 && (
                      <span className="text-[11px] text-slate-500 italic block">
                        + {challenge.tasks.length - 2} tiêu chí khác...
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Metadata & Action Button */}
                <div className="mt-5 pt-3 border-t border-[#222b3e] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{challenge.estimatedTime}</span>
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã vượt qua</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectChallenge(challenge);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                    }`}
                  >
                    <span>{isCompleted ? 'Làm lại' : 'Bắt đầu'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search finds nothing */}
        {filteredChallenges.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-[#242f47] bg-[#141b2a] space-y-3">
            <Trophy className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">
              Không tìm thấy thử thách phù hợp
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách thử thách.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Xem tất cả thử thách
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
