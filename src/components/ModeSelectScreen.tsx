import React from 'react';
import {
  Sparkles,
  Trophy,
  Zap,
  Keyboard,
  BookOpen,
  Search,
  ArrowRight,
  Flame,
  Layers,
  Award,
  CheckCircle,
} from 'lucide-react';
import { GameMode } from './GameScreen';
import { StudentProfile } from '../services/studentService';
import { ALL_BADGES } from '../services/badgeService';
import { ClassroomGoalBanner } from './ClassroomGoalBanner';
import { playSound } from '../utils/sound';

interface ModeSelectScreenProps {
  student: StudentProfile | null;
  onSelectMode: (mode: GameMode, targetTable?: number) => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenBadges: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  student,
  onSelectMode,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenBadges,
}) => {
  const handleModeClick = (mode: GameMode, targetTable?: number) => {
    playSound('click');
    onSelectMode(mode, targetTable);
  };

  const earnedBadges = student?.badges || [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-8">
      {/* 🤝 Class Cooperative Goal Banner */}
      <ClassroomGoalBanner
        currentStudentNickname={student?.nickname}
        currentStudentSolved={student?.totalSolved}
      />

      {/* Student Welcome / Personal Record & Badge Banner */}
      {student ? (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-800/60 border border-indigo-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow">
                {student.nickname.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-sm font-jua">
                    {student.nickname}
                  </span>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/40 font-bold">
                    {student.streakDays || 1}일 연속 출석
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 whitespace-nowrap">
                  <span>해결: <strong className="text-amber-300">{(student.totalSolved || 0).toLocaleString()}개</strong></span>
                  <span>•</span>
                  <span>최고 속도: <strong className="text-indigo-300">{student.bestSpeed ? `${student.bestSpeed}초` : '도전 전'}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playSound('click');
                  onOpenBadges();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl text-amber-300 font-bold text-xs transition active:scale-95 shadow-sm cursor-pointer"
                title="마스터 배지 도감 열기"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>배지 {earnedBadges.length}/{ALL_BADGES.length}</span>
              </button>
              <button
                onClick={() => {
                  playSound('click');
                  onOpenLeaderboard();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 rounded-xl text-indigo-300 font-bold text-xs transition active:scale-95 shadow-sm cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">명예의 전당</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-800/80 border border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="font-extrabold text-white text-sm">학습자 등록 후 마스터 배지를 수집해보세요!</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">닉네임만 설정하면 7단 마스터 배지 등 12개 배지를 모을 수 있습니다.</p>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onOpenAuth();
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            로그인 / 가입
          </button>
        </div>
      )}

      {/* 🪜 Recommended Learning Ladder Notice */}
      <div className="bg-slate-800/70 border border-indigo-500/20 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-indigo-300 font-jua">
            <Layers className="w-4 h-4 text-amber-400" />
            초등 5학년 맞춤 추천 성장 사다리
          </span>
          <span className="text-[11px] text-slate-500">차근차근 밟아가기</span>
        </div>
        <div className="flex items-center justify-between gap-1 text-[11px] text-center font-bold">
          <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-emerald-800/40 text-emerald-300">
            1. 키보드 기초
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-sky-800/40 text-sky-300">
            2. 단별 챌린지
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-amber-800/40 text-amber-300">
            3. 마스터 배지
          </div>
          <span className="text-slate-600">➔</span>
          <div className="flex-1 bg-slate-900/80 p-1.5 rounded-lg border border-indigo-700/40 text-indigo-300">
            4. 실전 스피드
          </div>
        </div>
      </div>

      {/* Mode List Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Stage 1: Keypad Practice (No Time Limit) */}
        <button
          onClick={() => handleModeClick('stage1')}
          className="group bg-slate-800/90 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition text-left flex items-center justify-between shadow-md active:scale-[0.99] cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-800/40">
                1단계
              </span>
              <span className="text-xs text-slate-400">시간 제한 없음 • 편안한 연습</span>
            </div>
            <h3 className="text-base font-bold font-jua text-white mt-1 flex items-center gap-1.5">
              <span>⌨️ 키보드 적응 & 기초 연습</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              넘버패드 5번 키 손가락 위치를 익히며 천천히 문제 푸는 단계
            </p>
          </div>
          <div className="text-2xl group-hover:scale-110 transition p-2 bg-slate-900/60 rounded-xl">🖐️</div>
        </button>

        {/* Stage 2: Specific Table Focus & 10-Question Master Badge Challenges */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-sky-950/90 text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-800/40">
                2단계
              </span>
              <span className="text-xs text-slate-300 font-bold">📚 단별 집중 & 마스터 챌린지</span>
            </div>
            <button
              onClick={() => {
                playSound('click');
                onOpenBadges();
              }}
              className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Award className="w-3 h-3" />
              <span>배지 도감 보기</span>
            </button>
          </div>

          {/* Group practice */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleModeClick('table_easy')}
              className="bg-slate-750 hover:bg-sky-600/70 p-2.5 rounded-xl border border-slate-600/80 text-xs font-bold text-center transition active:scale-95 text-slate-100 hover:text-white cursor-pointer"
            >
              🌱 기초 묶음 (2~5단)
            </button>
            <button
              onClick={() => handleModeClick('table_hard')}
              className="bg-slate-750 hover:bg-rose-600/70 p-2.5 rounded-xl border border-slate-600/80 text-xs font-bold text-center transition active:scale-95 text-slate-100 hover:text-white cursor-pointer"
            >
              🔥 고난도 묶음 (6~9단)
            </button>
          </div>

          {/* 🎯 Individual 10-Question Master Challenge Selector (2~9) */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1">
                <span>🎯 단별 10문제 연속 정답 ➔</span>
                <span className="text-amber-300">마스터 배지 즉시 획득!</span>
              </span>
              <span className="text-slate-400 text-[10px]">원하는 단 클릭</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {[2, 3, 4, 5, 6, 7, 8, 9].map((tableNum) => {
                const badgeId = `badge_table_${tableNum}`;
                const hasBadge = earnedBadges.includes(badgeId);
                const isSeven = tableNum === 7;

                return (
                  <button
                    key={tableNum}
                    onClick={() => handleModeClick('table_single', tableNum)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition active:scale-95 cursor-pointer relative ${
                      hasBadge
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                        : isSeven
                        ? 'bg-indigo-950/70 border-indigo-400/80 text-indigo-100 ring-1 ring-indigo-400'
                        : 'bg-slate-750 hover:bg-indigo-600/50 border-slate-600 text-slate-200'
                    }`}
                  >
                    {hasBadge && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow">
                        ✓
                      </span>
                    )}
                    <span className="text-xs font-black font-jua">
                      {tableNum}단
                    </span>
                    <span className="text-[10px] mt-0.5">
                      {isSeven ? '⚡' : tableNum >= 6 ? '🔥' : '🌱'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              💡 5학년 필수! <strong>7단</strong>을 눌러 10문제를 연속 정답하면 <strong>7단 마스터 배지</strong>를 얻을 수 있습니다.
            </p>
          </div>
        </div>

        {/* Stage 3: Speedrun Master (Recommended) */}
        <button
          onClick={() => handleModeClick('speedrun')}
          className="group relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 p-4 rounded-2xl shadow-xl transition text-left flex items-center justify-between border border-indigo-400/40 active:scale-[0.99] cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-indigo-950/80 text-indigo-200 px-2 py-0.5 rounded font-black border border-indigo-300/40 shadow-sm">
                3단계 실전 ★
              </span>
              <span className="text-xs text-indigo-100">2분 제한시간</span>
            </div>
            <h3 className="text-lg font-black font-jua text-white mt-1 flex items-center gap-1">
              <span>⚡ 5학년 실전 스피드런</span>
            </h3>
            <p className="text-xs text-indigo-100/90 mt-0.5">전체 무작위 문제 1.5초 자동반사 마스터!</p>
          </div>
          <div className="text-3xl group-hover:translate-x-1 transition p-2 bg-indigo-900/50 rounded-xl">🚀</div>
        </button>

        {/* Stage 4: Reverse Multiplication */}
        <button
          onClick={() => handleModeClick('reverse')}
          className="group bg-slate-800/90 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition text-left flex items-center justify-between shadow-md active:scale-[0.99] cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-800/40">
                4단계 응용 필살기
              </span>
              <span className="text-xs text-slate-400">약수·약분·통분 대비</span>
            </div>
            <h3 className="text-base font-bold font-jua text-white mt-1 flex items-center gap-1.5">
              <span>🔍 거꾸로 구구단 (약수 찾기)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">결과(예: 36)를 보고 두 곱셈 수(4×9 또는 6×6) 떠올리기</p>
          </div>
          <div className="text-2xl group-hover:scale-110 transition p-2 bg-slate-900/60 rounded-xl">💡</div>
        </button>
      </div>

      {/* Hall of Fame Big Banner */}
      <div className="pt-1">
        <button
          onClick={() => {
            playSound('click');
            onOpenLeaderboard();
          }}
          className="w-full p-4 bg-gradient-to-r from-slate-800 via-amber-950/30 to-slate-800 border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl text-left flex items-center justify-between shadow-lg transition active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-400/40">
              🏆
            </div>
            <div>
              <div className="font-extrabold text-white text-sm font-jua flex items-center gap-1.5">
                <span>학습자 명예의 전당 보러가기</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                  스피드 • 노력왕 • 성장왕
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                속도 1등뿐만 아니라 최다 문제 해결 노력왕, 어제보다 발전한 성장왕까지!
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
