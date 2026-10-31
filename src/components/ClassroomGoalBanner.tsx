import React, { useEffect, useState } from 'react';
import { TrendingUp, Flag, CheckCircle } from 'lucide-react';
import { ClassStats, subscribeClassStats } from '../services/studentService';

interface ClassroomGoalBannerProps {
  currentStudentSolved?: number;
  currentStudentNickname?: string;
  compact?: boolean;
}

export const ClassroomGoalBanner: React.FC<ClassroomGoalBannerProps> = ({
  currentStudentSolved,
  currentStudentNickname,
  compact = false,
}) => {
  const [stats, setStats] = useState<ClassStats>({
    totalProblemsSolved: 0,
    targetGoal: 1000,
    milestoneTitle: '',
    averageScore: 80.0,
    targetScore: 80,
    currentWeek: 1,
    totalParticipants: 0,
    totalScoreSum: 0,
    startDate: new Date().toISOString(),
  });

  useEffect(() => {
    const unsub = subscribeClassStats((newStats) => {
      setStats(newStats);
    });
    return () => unsub();
  }, []);

  const avg = stats.averageScore != null ? stats.averageScore : 80.0;
  const target = stats.targetScore != null ? stats.targetScore : 80;
  const isGoalReached = avg >= target;
  const diffToGoal = Number(Math.max(0, target - avg).toFixed(1));

  // Gauge percentage relative to 100 points
  const fillPct = Math.min(100, Math.max(0, Math.round(avg)));

  if (compact) {
    return (
      <div className="bg-slate-800/90 border border-indigo-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs whitespace-nowrap overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-bold">2분 평균:</span>
          <span className="font-black text-amber-300 font-jua text-sm">{avg.toFixed(1)}점</span>
          <span className="text-slate-400 text-[11px]">(목표 {target}점)</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-16 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalReached ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-amber-400'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          {isGoalReached ? (
            <span className="text-[10px] text-emerald-400 font-bold shrink-0">달성! 🎉</span>
          ) : (
            <span className="text-[10px] text-amber-300 font-bold shrink-0">-{diffToGoal}점</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden backdrop-blur-md space-y-2.5">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Title & Score Box - Guaranteed single line flex without awkward wrap */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
            <h3 className="font-black text-white text-sm sm:text-base font-jua truncate">
              우리 반 2분 평균 점수
            </h3>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0">
              {stats.currentWeek}주차
            </span>
          </div>
        </div>

        {/* Live Average Score Display - Fits on a single line */}
        <div className="bg-slate-950/70 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-inner">
          <span className="text-[11px] text-slate-400 font-medium">평균</span>
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-jua leading-none">
            {avg.toFixed(1)}점
          </span>
          <span className="text-[11px] text-indigo-300 font-bold opacity-90">
            (목표 {target}점)
          </span>
        </div>
      </div>

      {/* 100-Point Scale Progress Bar with Target Flag Marker */}
      <div className="space-y-1">
        {/* Sub-label row: strictly one line */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 whitespace-nowrap">
          <span className="text-indigo-300 truncate">
            {stats.currentWeek}주차 목표: <strong>{target}점</strong> (다음 주: {Math.min(100, target + 5)}점)
          </span>

          <span className="font-jua text-xs shrink-0 flex items-center gap-1">
            {isGoalReached ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                목표 달성! (+{Number((avg - target).toFixed(1))}점)
              </span>
            ) : (
              <span className="text-amber-300">
                목표까지 <strong className="text-white font-bold">{diffToGoal}점</strong> 남음
              </span>
            )}
          </span>
        </div>

        {/* The Bar with 100-point width and target indicator */}
        <div className="relative w-full bg-slate-950/90 rounded-full h-3.5 p-0.5 border border-slate-700/80 shadow-inner">
          {/* Target Flag marker line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
            style={{ left: `${target}%` }}
            title={`목표: ${target}점`}
          >
            <div className="absolute -top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 py-0.2 rounded shadow flex items-center gap-0.5 leading-tight">
                <Flag className="w-2 h-2" />
                {target}
              </span>
            </div>
          </div>

          {/* Filled Progress Bar */}
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-md relative ${
              isGoalReached
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 shadow-amber-500/30'
            }`}
            style={{ width: `${fillPct}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Weekly Milestone Markers - Compact single line */}
        <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-bold px-1 whitespace-nowrap">
          <span className={stats.currentWeek === 1 ? 'text-amber-300 font-bold' : ''}>1주(80점)</span>
          <span className={stats.currentWeek === 2 ? 'text-amber-300 font-bold' : ''}>2주(85점)</span>
          <span className={stats.currentWeek === 3 ? 'text-amber-300 font-bold' : ''}>3주(90점)</span>
          <span className={stats.currentWeek === 4 ? 'text-amber-300 font-bold' : ''}>4주(95점)</span>
          <span className={stats.currentWeek >= 5 ? 'text-amber-300 font-bold' : ''}>5주(100점👑)</span>
        </div>
      </div>

      {/* Student Personal Contribution Info - Strictly single line */}
      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 whitespace-nowrap gap-2 overflow-hidden">
        <div className="truncate">
          {currentStudentNickname ? (
            <span>
              <strong>{currentStudentNickname}</strong> 학생 스피드런 점수 합산 중
            </span>
          ) : (
            <span>2분 스피드런으로 우리 반 평균을 올려보세요!</span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 shrink-0">
          <span>누적 참여: <strong className="text-slate-300">{stats.totalParticipants}회</strong></span>
        </div>
      </div>
    </div>
  );
};
