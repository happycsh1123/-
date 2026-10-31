import React, { useState } from 'react';
import { Award, Lock, CheckCircle2, X, Sparkles, Trophy, Zap, Shield, ChevronRight } from 'lucide-react';
import { ALL_BADGES, BadgeDefinition, getStudentTitle } from '../services/badgeService';
import { StudentProfile } from '../services/studentService';
import { playSound } from '../utils/sound';

interface BadgeShowcaseModalProps {
  student: StudentProfile | null;
  onClose: () => void;
  onStartTableChallenge?: (tableNumber: number) => void;
}

export const BadgeShowcaseModal: React.FC<BadgeShowcaseModalProps> = ({
  student,
  onClose,
  onStartTableChallenge,
}) => {
  const [filter, setFilter] = useState<'all' | 'table' | 'achievement'>('all');

  const earnedBadgeIds = student?.badges || [];
  const totalBadges = ALL_BADGES.length;
  const earnedCount = earnedBadgeIds.length;
  const progressPct = Math.round((earnedCount / totalBadges) * 100);

  const { title, color: titleColor } = getStudentTitle(earnedCount);

  const filteredBadges = ALL_BADGES.filter((b) => {
    if (filter === 'table') return b.category === 'table';
    if (filter === 'achievement') return b.category === 'achievement' || b.category === 'special';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-5 border-b border-slate-800 relative">
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-amber-500/30">
              🏅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-jua">
                  {student?.nickname || '학생'}의 마스터 배지 도감
                </h2>
              </div>
              <p className={`text-xs font-bold ${titleColor} flex items-center gap-1 mt-0.5`}>
                <span>현재 칭호: {title}</span>
              </p>
            </div>
          </div>

          {/* Collection Progress */}
          <div className="mt-3 bg-slate-900/80 p-3 rounded-2xl border border-indigo-500/30 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                배지 수집 현황: <strong className="text-amber-300">{earnedCount}</strong> / {totalBadges}개 획득
              </span>
              <span className="text-amber-400 font-jua">{progressPct}% 달성</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 pt-3 pb-2 flex gap-1.5 border-b border-slate-800/80 bg-slate-900/60">
          <button
            onClick={() => {
              playSound('click');
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            전체 배지 ({totalBadges})
          </button>
          <button
            onClick={() => {
              playSound('click');
              setFilter('table');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              filter === 'table'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            단별 마스터 (2~9단)
          </button>
          <button
            onClick={() => {
              playSound('click');
              setFilter('achievement');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              filter === 'achievement'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            특별 업적 & 그랜드마스터
          </button>
        </div>

        {/* Badge Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredBadges.map((badge) => {
            const isUnlocked = earnedBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex gap-3 ${
                  isUnlocked
                    ? `bg-slate-800/90 ${badge.borderClass}`
                    : 'bg-slate-850/50 border-slate-800 text-slate-500 opacity-75'
                }`}
              >
                {/* Icon box */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md ${
                    isUnlocked
                      ? `bg-gradient-to-tr ${badge.colorClass}`
                      : 'bg-slate-800 border border-slate-700 text-slate-600'
                  }`}
                >
                  {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-600" />}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-sm font-extrabold font-jua truncate ${
                          isUnlocked ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {badge.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-bold shrink-0">
                          획득 완료 ✓
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.2 rounded-full font-medium shrink-0">
                          미획득
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {badge.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <span className="text-[10px] text-indigo-300 font-semibold truncate">
                      🎯 {badge.requirement}
                    </span>

                    {!isUnlocked && badge.tableNumber && onStartTableChallenge && (
                      <button
                        onClick={() => {
                          playSound('click');
                          onClose();
                          onStartTableChallenge(badge.tableNumber!);
                        }}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-2 py-0.5 rounded-lg transition shrink-0 flex items-center gap-0.5 cursor-pointer shadow-sm"
                      >
                        <span>도전</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            💡 단별 집중 훈련에서 <strong>해당 단 10문제를 연속으로 정답</strong> 맞히면 마스터 배지가 즉시 지급됩니다!
          </p>
        </div>
      </div>
    </div>
  );
};
