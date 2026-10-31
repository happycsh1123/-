import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Zap,
  Flame,
  TrendingUp,
  Award,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Calendar,
  Users,
} from 'lucide-react';
import {
  GameScoreRecord,
  StudentProfile,
  subscribeScores,
  subscribeUsers,
} from '../services/studentService';
import { ClassroomGoalBanner } from './ClassroomGoalBanner';
import { playSound } from '../utils/sound';

interface LeaderboardViewProps {
  currentNickname?: string;
  currentStudentSolved?: number;
  onBackToMenu: () => void;
  onPlayAgain: (mode?: string) => void;
}

type MainTab = 'speed' | 'effort' | 'growth' | 'streak';
type ModeFilter = 'all' | 'speedrun' | 'reverse' | 'table_hard' | 'table_easy' | 'stage1';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentNickname,
  currentStudentSolved,
  onBackToMenu,
  onPlayAgain,
}) => {
  const [mainTab, setMainTab] = useState<MainTab>('speed');
  const [speedModeFilter, setSpeedModeFilter] = useState<ModeFilter>('all');
  const [scores, setScores] = useState<GameScoreRecord[]>([]);
  const [users, setUsers] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let unsubUsers: (() => void) | null = null;

    const unsubScores = subscribeScores(
      (allScores) => {
        setScores(allScores);
        setLoading(false);
      },
      () => setLoading(false)
    );

    unsubUsers = subscribeUsers((allUsers) => {
      setUsers(allUsers);
    });

    return () => {
      unsubScores();
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // 1. Speed Ranking List
  const filteredSpeedScores = React.useMemo(() => {
    let list = scores;
    if (speedModeFilter !== 'all') {
      list = list.filter((s) => s.mode === speedModeFilter);
    }
    return [...list].sort((a, b) => {
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      return (a.avgSpeed || 99) - (b.avgSpeed || 99);
    });
  }, [scores, speedModeFilter]);

  // 2. Effort Ranking List (최다 문제 해결 노력왕)
  const effortRanking = React.useMemo(() => {
    return [...users]
      .filter((u) => (u.totalSolved || 0) > 0)
      .sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
  }, [users]);

  // 3. Growth Ranking List (가장 많이 단축된 성장왕)
  const growthRanking = React.useMemo(() => {
    return [...users]
      .filter((u) => (u.speedImprovement || 0) > 0)
      .sort((a, b) => (b.speedImprovement || 0) - (a.speedImprovement || 0));
  }, [users]);

  // 4. Streak Ranking List (연속 출석 성실왕)
  const streakRanking = React.useMemo(() => {
    return [...users]
      .filter((u) => (u.streakDays || 0) > 0)
      .sort((a, b) => (b.streakDays || 0) - (a.streakDays || 0));
  }, [users]);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}시간 전`;
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch {
      return '';
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'speedrun':
        return <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded text-[10px] font-bold">⚡ 실전스피드런</span>;
      case 'reverse':
        return <span className="bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded text-[10px] font-bold">🔍 거꾸로(약수)</span>;
      case 'table_hard':
        return <span className="bg-rose-950/80 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded text-[10px] font-bold">🔥 6~9단 집중</span>;
      case 'table_easy':
        return <span className="bg-sky-950/80 text-sky-300 border border-sky-700/60 px-2 py-0.5 rounded text-[10px] font-bold">🌱 2~5단 기초</span>;
      default:
        return <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-bold">⌨️ 키보드연습</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-12">
      {/* Collaborative Classroom Progress Banner */}
      <ClassroomGoalBanner
        currentStudentNickname={currentNickname}
        currentStudentSolved={currentStudentSolved}
      />

      {/* Main Header */}
      <div className="bg-gradient-to-r from-amber-600/20 via-indigo-600/20 to-purple-600/20 border border-amber-500/40 rounded-3xl p-5 text-center shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/20 text-amber-400 mb-2 border border-amber-400/40">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-white font-jua tracking-wide">
          구구단 명예의 전당
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          스피드 1위뿐만 아니라 <strong>누적 노력, 나만의 성장, 성실한 출석</strong>까지 모두가 주인공이 됩니다!
        </p>
      </div>

      {/* Main 4 Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => {
            playSound('click');
            setMainTab('speed');
          }}
          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            mainTab === 'speed'
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5 text-amber-300" />
          <span className="font-bold text-xs font-jua">⚡ 실전 스피드</span>
          <span className="text-[10px] opacity-80">최고 속도 랭킹</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setMainTab('effort');
          }}
          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            mainTab === 'effort'
              ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Flame className="w-5 h-5 text-amber-300" />
          <span className="font-bold text-xs font-jua">🔥 최다 해결 노력왕</span>
          <span className="text-[10px] opacity-80">문제를 많이 푼 순위</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setMainTab('growth');
          }}
          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            mainTab === 'growth'
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-emerald-300" />
          <span className="font-bold text-xs font-jua">📈 속도 단축 성장왕</span>
          <span className="text-[10px] opacity-80">어제보다 발전한 순위</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setMainTab('streak');
          }}
          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
            mainTab === 'streak'
              ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 text-purple-300" />
          <span className="font-bold text-xs font-jua">⭐ 연속 출석 성실왕</span>
          <span className="text-[10px] opacity-80">매일 꾸준한 순위</span>
        </button>
      </div>

      {/* Sub-Filter for Speed Mode */}
      {mainTab === 'speed' && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'all', label: '⚡ 전체 종합' },
            { key: 'speedrun', label: '🚀 실전 스피드런' },
            { key: 'reverse', label: '🔍 거꾸로 (약수)' },
            { key: 'table_hard', label: '🔥 6~9단' },
            { key: 'table_easy', label: '🌱 2~5단' },
            { key: 'stage1', label: '⌨️ 1단계 기초' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                playSound('click');
                setSpeedModeFilter(tab.key as ModeFilter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                speedModeFilter === tab.key
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <p className="text-xs">기록을 불러오는 중...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Speed Ranking View */}
          {mainTab === 'speed' && (
            <div className="space-y-3">
              {filteredSpeedScores.length === 0 ? (
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-xs text-slate-400">아직 등록된 기록이 없습니다.</p>
                  <button
                    onClick={() => onPlayAgain(speedModeFilter === 'all' ? 'speedrun' : speedModeFilter)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                  >
                    🚀 지금 첫 도전하기
                  </button>
                </div>
              ) : (
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Medal className="w-4 h-4 text-amber-400" />
                      스피드 랭킹 ({filteredSpeedScores.length}개 기록)
                    </span>
                    <span className="text-[11px] text-slate-500">실시간 연동 중</span>
                  </div>

                  <div className="divide-y divide-slate-700/60 max-h-[380px] overflow-y-auto">
                    {filteredSpeedScores.map((record, index) => {
                      const rank = index + 1;
                      const isMe = record.nickname === currentNickname;
                      return (
                        <div
                          key={record.id || index}
                          className={`p-3 flex items-center justify-between gap-2 transition ${
                            isMe ? 'bg-indigo-900/30' : 'hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 text-center font-bold text-sm">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400 text-xs font-mono">{rank}</span>}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold truncate ${isMe ? 'text-indigo-300 font-extrabold' : 'text-slate-100'}`}>
                                  {record.nickname}
                                </span>
                                {isMe && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-extrabold">나</span>}
                                {getModeBadge(record.mode)}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{formatDate(record.createdAt)}</span>
                                <span>•</span>
                                <span>정확도 {record.accuracy}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-extrabold text-white text-sm font-jua">
                              {record.correctCount}문항 정답
                            </div>
                            <div className="text-[11px] text-indigo-400 font-bold flex items-center justify-end gap-1">
                              <Zap className="w-3 h-3 text-amber-400" />
                              <span>평균 {record.avgSpeed}초</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Effort Ranking (최다 문제 해결 노력왕) */}
          {mainTab === 'effort' && (
            <div className="space-y-3">
              <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>🔥 노력왕 랭킹:</strong> 속도가 느려도 문제를 많이 풀수록 순위가 올라갑니다! 우리 반 협동 목표에 가장 많이 기여한 학생들입니다.
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    누적 해결 문제 수 TOP ({effortRanking.length}명)
                  </span>
                  <span className="text-[11px] text-slate-500">지속적인 노력의 힘!</span>
                </div>

                <div className="divide-y divide-slate-700/60 max-h-[380px] overflow-y-auto">
                  {effortRanking.map((user, index) => {
                    const rank = index + 1;
                    const isMe = user.nickname === currentNickname;
                    return (
                      <div
                        key={user.nickname}
                        className={`p-3 flex items-center justify-between gap-2 transition ${
                          isMe ? 'bg-amber-900/20' : 'hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 text-center font-bold text-sm">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400 text-xs font-mono">{rank}</span>}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold truncate ${isMe ? 'text-amber-300 font-extrabold' : 'text-slate-100'}`}>
                                {user.nickname}
                              </span>
                              {isMe && <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">나</span>}
                              <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">
                                {user.streakDays || 1}일 출석
                              </span>
                              {user.badges && user.badges.length > 0 && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                  <span>🏅</span>
                                  <span>{user.badges.length}개</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              최고 속도: {user.bestSpeed ? `${user.bestSpeed}초` : '기록 없음'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-amber-400 text-base font-jua">
                            {(user.totalSolved || 0).toLocaleString()}문제 해결!
                          </div>
                          <div className="text-[10px] text-emerald-400 font-bold">
                            클래스 기여 완료 👏
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Growth Ranking (속도 단축 성장왕) */}
          {mainTab === 'growth' && (
            <div className="space-y-3">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>📈 성장왕 랭킹:</strong> 처음 시작했을 때보다 자신의 반응 속도를 가장 많이 단축한 학생들의 랭킹입니다!
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    나를 뛰어넘은 성장 TOP ({growthRanking.length}명)
                  </span>
                  <span className="text-[11px] text-slate-500">어제의 나와의 경쟁</span>
                </div>

                <div className="divide-y divide-slate-700/60 max-h-[380px] overflow-y-auto">
                  {growthRanking.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      연습을 2회 이상 진행하면 이전 기록 대비 단축된 시간이 이곳에 표시됩니다!
                    </div>
                  ) : (
                    growthRanking.map((user, index) => {
                      const rank = index + 1;
                      const isMe = user.nickname === currentNickname;
                      return (
                        <div
                          key={user.nickname}
                          className={`p-3 flex items-center justify-between gap-2 transition ${
                            isMe ? 'bg-emerald-900/20' : 'hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 text-center font-bold text-sm">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400 text-xs font-mono">{rank}</span>}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold truncate ${isMe ? 'text-emerald-300 font-extrabold' : 'text-slate-100'}`}>
                                  {user.nickname}
                                </span>
                                {isMe && <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">나</span>}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                처음: {user.initialSpeed}초 ➔ 현재: <strong className="text-slate-200">{user.bestSpeed}초</strong>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-emerald-400 text-base font-jua flex items-center justify-end gap-1">
                              <span>-{user.speedImprovement}초 단축! 🚀</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              엄청난 성장세 칭찬해요!
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Streak Ranking (연속 출석 성실왕) */}
          {mainTab === 'streak' && (
            <div className="space-y-3">
              <div className="bg-purple-950/30 border border-purple-500/30 p-3 rounded-2xl text-xs text-purple-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  <strong>⭐ 성실왕 랭킹:</strong> 매일 하루도 빠짐없이 출석하여 구구단 훈련을 이어가는 성실한 마스터들입니다!
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    연속 출석일수 TOP ({streakRanking.length}명)
                  </span>
                  <span className="text-[11px] text-slate-500">꾸준함이 최고의 무기</span>
                </div>

                <div className="divide-y divide-slate-700/60 max-h-[380px] overflow-y-auto">
                  {streakRanking.map((user, index) => {
                    const rank = index + 1;
                    const isMe = user.nickname === currentNickname;
                    return (
                      <div
                        key={user.nickname}
                        className={`p-3 flex items-center justify-between gap-2 transition ${
                          isMe ? 'bg-purple-900/20' : 'hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 text-center font-bold text-sm">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-slate-400 text-xs font-mono">{rank}</span>}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-bold truncate ${isMe ? 'text-purple-300 font-extrabold' : 'text-slate-100'}`}>
                                {user.nickname}
                              </span>
                              {isMe && <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black">나</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              총 {(user.totalSolved || 0).toLocaleString()}문제 해결 중
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-black text-amber-300 text-base font-jua">
                            🔥 {user.streakDays || 1}일 연속 출석!
                          </div>
                          <div className="text-[10px] text-purple-300">
                            매일 실력 향상 중
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Footer */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            playSound('click');
            onPlayAgain();
          }}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>나도 도전해서 점수 올리기!</span>
        </button>
        <button
          onClick={() => {
            playSound('click');
            onBackToMenu();
          }}
          className="py-3 px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메뉴로</span>
        </button>
      </div>
    </div>
  );
};
