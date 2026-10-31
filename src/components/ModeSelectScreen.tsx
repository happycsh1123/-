import React from 'react';
import { Sparkles, Trophy, Zap, Keyboard, BookOpen, Search, ArrowRight, Flame } from 'lucide-react';
import { GameMode } from './GameScreen';
import { StudentProfile } from '../services/studentService';
import { playSound } from '../utils/sound';

interface ModeSelectScreenProps {
  student: StudentProfile | null;
  onSelectMode: (mode: GameMode) => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  student,
  onSelectMode,
  onOpenLeaderboard,
  onOpenAuth,
}) => {
  const handleModeClick = (mode: GameMode) => {
    playSound('click');
    onSelectMode(mode);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-8">
      {/* Student Welcome / Profile Banner */}
      {student ? (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-800/60 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-extrabold text-base shadow">
              {student.nickname.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm font-jua">
                  {student.nickname}
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/40 font-bold">
                  5학년 수학 도전자
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                오늘도 1.5초 이내 자동반사 구구단에 도전해보세요!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl text-amber-300 font-bold text-xs transition active:scale-95 shadow-sm cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>명예의 전당</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-800/80 border border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <h3 className="font-extrabold text-white text-sm">학습자 등록 후 점수를 기록해보세요!</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">닉네임만 설정하면 명예의 전당에 실시간 등재됩니다.</p>
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

      {/* Target Notice */}
      <div className="text-center my-1 space-y-1">
        <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-xs px-3.5 py-1 rounded-full border border-indigo-500/30 font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>목표: 키보드 입력 적응 후 1.5초 자동반사!</span>
        </span>
        <h2 className="text-2xl font-black text-white font-jua">단계별 훈련 모드 선택</h2>
      </div>

      {/* Mode List Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Stage 1: Keypad Practice (No Time Limit) */}
        <button
          onClick={() => handleModeClick('stage1')}
          className="group bg-slate-800/90 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition text-left flex items-center justify-between shadow-md active:scale-[0.99] cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-800/40">
                1단계
              </span>
              <span className="text-xs text-slate-400">시간 제한 없음</span>
            </div>
            <h3 className="text-base font-bold font-jua text-white mt-1 flex items-center gap-1.5">
              <span>⌨️ 키보드 적응 & 기초 연습</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">키패드 위치를 익히며 천천히 문제 푸는 단계</p>
          </div>
          <div className="text-2xl group-hover:scale-110 transition p-2 bg-slate-900/60 rounded-xl">🖐️</div>
        </button>

        {/* Stage 2: Specific Table Focus */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-2 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-sky-950/90 text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-800/40">
                2단계
              </span>
              <span className="text-xs text-slate-400">부분 집중</span>
            </div>
            <span className="text-xs text-slate-400">집중 단 선택</span>
          </div>
          <h3 className="text-base font-bold font-jua text-white flex items-center gap-1.5">
            <span>📚 단별 집중 훈련</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleModeClick('table_easy')}
              className="bg-slate-750 hover:bg-indigo-600/70 p-3 rounded-xl border border-slate-600/80 text-xs font-bold text-center transition active:scale-95 text-slate-100 hover:text-white cursor-pointer"
            >
              🌱 기초 (2~5단)
            </button>
            <button
              onClick={() => handleModeClick('table_hard')}
              className="bg-slate-750 hover:bg-indigo-600/70 p-3 rounded-xl border border-slate-600/80 text-xs font-bold text-center transition active:scale-95 text-slate-100 hover:text-white cursor-pointer"
            >
              🔥 고난도 (6~9단)
            </button>
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
                3단계 추천 ★
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
          className="group bg-slate-800/90 hover:bg-slate-750 p-4 rounded-2xl border border-slate-700 hover:border-slate-600 transition text-left flex items-center justify-between shadow-md active:scale-[0.99] cursor-pointer"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-800/40">
                4단계 필살기
              </span>
              <span className="text-xs text-slate-400">약수·통분 대비</span>
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
                  실시간 랭킹
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                전체 학습자들의 최고 연산 속도와 랭킹을 확인해보세요.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* Grade 5 Keyboard Tip */}
      <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1 shadow-inner">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <span>💡 키보드 넘버패드 팁:</span>
        </div>
        <p className="leading-relaxed">
          키보드의 <strong>오른쪽 숫자패드(넘버패드)</strong>를 사용하고, 처음엔 1단계에서 손가락 위치를 천천히 익히면 실전에서 1.5초 이내 자동반사가 완성됩니다!
        </p>
      </div>
    </div>
  );
};
