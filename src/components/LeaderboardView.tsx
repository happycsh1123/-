import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Zap, Clock, Target, ArrowLeft, RotateCw, Sparkles, User } from 'lucide-react';
import { GameScoreRecord, subscribeScores } from '../services/studentService';
import { playSound } from '../utils/sound';

interface LeaderboardViewProps {
  currentNickname?: string;
  onBackToMenu: () => void;
  onPlayAgain: (mode?: string) => void;
}

type ModeFilter = 'all' | 'speedrun' | 'reverse' | 'table_hard' | 'table_easy' | 'stage1';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentNickname,
  onBackToMenu,
  onPlayAgain,
}) => {
  const [scores, setScores] = useState<GameScoreRecord[]>([]);
  const [filter, setFilter] = useState<ModeFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeScores(
      (allScores) => {
        setScores(allScores);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter and sort scores
  const filteredScores = React.useMemo(() => {
    let list = scores;
    if (filter !== 'all') {
      list = list.filter((s) => s.mode === filter);
    }
    // Sort primarily by correctCount descending, then avgSpeed ascending (faster is better)
    return [...list].sort((a, b) => {
      if (b.correctCount !== a.correctCount) {
        return b.correctCount - a.correctCount;
      }
      return (a.avgSpeed || 99) - (b.avgSpeed || 99);
    });
  }, [scores, filter]);

  const topThree = filteredScores.slice(0, 3);
  const remaining = filteredScores.slice(3);

  // User's own best record in this filtered view
  const myBest = React.useMemo(() => {
    if (!currentNickname) return null;
    const myIndex = filteredScores.findIndex((s) => s.nickname === currentNickname);
    if (myIndex === -1) return null;
    return {
      rank: myIndex + 1,
      record: filteredScores[myIndex],
    };
  }, [filteredScores, currentNickname]);

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600/30 via-indigo-600/30 to-purple-600/30 border border-amber-500/40 rounded-3xl p-5 text-center shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/20 text-amber-400 mb-2 border border-amber-400/40">
          <Trophy className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-white font-jua tracking-wide flex items-center justify-center gap-2">
          <span>구구단 명예의 전당</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          초등 5학년 구구단 마스터들의 실시간 랭킹 & 연산 속도 기록
        </p>

        {myBest && (
          <div className="mt-3 inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-400/50 px-3.5 py-1.5 rounded-full text-xs text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              <strong>{currentNickname}</strong>님의 현재 순위:{' '}
              <span className="font-extrabold text-amber-300 text-sm">#{myBest.rank}위</span> ({myBest.record.correctCount}개 정답 / 평균 {myBest.record.avgSpeed}초)
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
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
              setFilter(tab.key as ModeFilter);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              filter === tab.key
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
          <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <p className="text-xs">명예의 전당 기록을 불러오는 중...</p>
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-10 text-center space-y-3">
          <div className="text-4xl">🌟</div>
          <h3 className="text-lg font-bold text-white font-jua">아직 등록된 기록이 없습니다</h3>
          <p className="text-xs text-slate-400">
            지금 훈련을 완료하고 이 모드의 첫 번째 명예의 전당 주인공이 되어보세요!
          </p>
          <button
            onClick={() => {
              playSound('click');
              onPlayAgain(filter === 'all' ? 'speedrun' : filter);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            🚀 지금 첫 도전하기
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (If available) */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Silver (Rank 2) */}
              {topThree[1] && (
                <div
                  className={`order-2 sm:order-1 bg-slate-800/90 border p-3.5 rounded-2xl text-center space-y-2 relative transition ${
                    topThree[1].nickname === currentNickname
                      ? 'border-indigo-400 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-600/70'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-200 text-base font-extrabold shadow">
                    🥈
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1 truncate">
                      <span>{topThree[1].nickname}</span>
                      {topThree[1].nickname === currentNickname && (
                        <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">나</span>
                      )}
                    </div>
                    <div className="text-xl font-extrabold text-white font-jua mt-0.5">
                      {topThree[1].correctCount}개
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <div>속도: <span className="font-bold text-indigo-300">{topThree[1].avgSpeed}초</span></div>
                    <div>정확도: <span className="font-bold text-amber-300">{topThree[1].accuracy}%</span></div>
                  </div>
                </div>
              )}

              {/* Gold (Rank 1) */}
              {topThree[0] && (
                <div
                  className={`order-1 sm:order-2 bg-gradient-to-b from-amber-950/40 to-slate-800/95 border-2 p-4 rounded-2xl text-center space-y-2 relative shadow-xl transform sm:-translate-y-2 transition ${
                    topThree[0].nickname === currentNickname
                      ? 'border-amber-400 shadow-amber-500/30'
                      : 'border-amber-500/80 shadow-amber-500/20'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow flex items-center gap-1">
                    <span>👑 1위 최고 마스터</span>
                  </div>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 text-2xl font-extrabold shadow mt-1">
                    🥇
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-amber-200 flex items-center justify-center gap-1 truncate">
                      <span>{topThree[0].nickname}</span>
                      {topThree[0].nickname === currentNickname && (
                        <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">나</span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-amber-300 font-jua mt-0.5">
                      {topThree[0].correctCount}개 해결
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5 bg-slate-900/80 p-2 rounded-xl border border-amber-500/30">
                    <div>평균 속도: <strong className="text-amber-300 font-bold">{topThree[0].avgSpeed}초 ⚡</strong></div>
                    <div>정확도: <strong className="text-emerald-400 font-bold">{topThree[0].accuracy}%</strong></div>
                  </div>
                </div>
              )}

              {/* Bronze (Rank 3) */}
              {topThree[2] && (
                <div
                  className={`order-3 bg-slate-800/90 border p-3.5 rounded-2xl text-center space-y-2 relative transition ${
                    topThree[2].nickname === currentNickname
                      ? 'border-indigo-400 shadow-lg shadow-indigo-500/20'
                      : 'border-amber-900/60'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-950/80 text-amber-400 text-base font-extrabold shadow">
                    🥉
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1 truncate">
                      <span>{topThree[2].nickname}</span>
                      {topThree[2].nickname === currentNickname && (
                        <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-bold">나</span>
                      )}
                    </div>
                    <div className="text-xl font-extrabold text-white font-jua mt-0.5">
                      {topThree[2].correctCount}개
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <div>속도: <span className="font-bold text-indigo-300">{topThree[2].avgSpeed}초</span></div>
                    <div>정확도: <span className="font-bold text-amber-300">{topThree[2].accuracy}%</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Rankings Table / List */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-400" />
                전체 순위 리스트 ({filteredScores.length}개 기록)
              </span>
              <span className="text-[11px] text-slate-500">실시간 연동 중</span>
            </div>

            <div className="divide-y divide-slate-700/60 max-h-[380px] overflow-y-auto">
              {filteredScores.map((record, index) => {
                const rank = index + 1;
                const isMe = record.nickname === currentNickname;

                return (
                  <div
                    key={record.id || index}
                    className={`p-3 flex items-center justify-between gap-2 transition ${
                      isMe
                        ? 'bg-indigo-900/30 hover:bg-indigo-900/40'
                        : 'hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 text-center font-bold text-sm">
                        {rank === 1 ? (
                          '🥇'
                        ) : rank === 2 ? (
                          '🥈'
                        ) : rank === 3 ? (
                          '🥉'
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">{rank}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-bold truncate ${
                              isMe ? 'text-indigo-300 font-extrabold' : 'text-slate-100'
                            }`}
                          >
                            {record.nickname}
                          </span>
                          {isMe && (
                            <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded font-extrabold shrink-0">
                              나
                            </span>
                          )}
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
        </>
      )}

      {/* Action Footer */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            playSound('click');
            onPlayAgain(filter === 'all' ? 'speedrun' : filter);
          }}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>새 기록 도전하기!</span>
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
