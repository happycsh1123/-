import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { GameResultData } from './GameScreen';
import { StudentProfile, recordGameScore } from '../services/studentService';
import { playSound } from '../utils/sound';

interface ResultScreenProps {
  result: GameResultData;
  student: StudentProfile | null;
  onGoToLeaderboard: () => void;
  onPlayAgain: () => void;
  onGoToMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  student,
  onGoToLeaderboard,
  onPlayAgain,
  onGoToMenu,
}) => {
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | 'idle'>('idle');

  const { avgSpeed, correctCount, accuracy, tableTimes } = result;

  // Trigger celebration on load
  useEffect(() => {
    if (avgSpeed > 0 && avgSpeed <= 1.5 && accuracy >= 90) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      playSound('fanfare');
    }

    // Auto-save to Firebase if student profile exists
    if (student && student.nickname) {
      setSaveStatus('saving');
      recordGameScore({
        nickname: student.nickname,
        mode: result.mode,
        modeTitle: result.modeTitle,
        score: correctCount * 10,
        correctCount,
        wrongCount: result.wrongCount,
        accuracy,
        avgSpeed,
      })
        .then(() => {
          setSaveStatus('saved');
        })
        .catch((err) => {
          console.error('Failed to record game score:', err);
          setSaveStatus('error');
        });
    }
  }, [accuracy, avgSpeed, correctCount, result, student]);

  // Identify weakest table
  let slowestTable: number | null = null;
  let slowestTime = 0;
  for (let t = 2; t <= 9; t++) {
    const times = tableTimes[t];
    if (times && times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      if (avg > slowestTime) {
        slowestTime = avg;
        slowestTable = t;
      }
    }
  }

  // Evaluation copy
  let evalConfig = {
    emoji: '🏆',
    badge: '5학년 실전 완벽 대비!',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    title: '1.5초 자동반사 마스터!',
    descClass: 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200',
    desc: `⚡ 환상적인 입력 속도 (평균 ${avgSpeed.toFixed(1)}초): 키보드 적응과 구구단 암기가 완벽합니다! 분수의 약분과 통분 문제를 풀 때 연산 속도가 아주 강력한 무기가 됩니다.`,
  };

  if (avgSpeed === 0 || avgSpeed > 2.5 || accuracy < 80) {
    evalConfig = {
      emoji: '🌱',
      badge: '차근차근 실력 향상 중!',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      title: '꾸준히 연습해 봐요!',
      descClass: 'bg-amber-950/30 border-amber-500/30 text-amber-200',
      desc: `💡 키보드 넘버패드 연습 권장 (평균 ${avgSpeed.toFixed(1)}초): 아직 키보드 숫자 위치가 다소 헷갈릴 수 있습니다. 1단계에서 손가락 위치를 먼저 천천히 익히면 순식간에 빨라집니다.`,
    };
  } else if (avgSpeed > 1.5) {
    evalConfig = {
      emoji: '👏',
      badge: '안정적인 흐름!',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      title: '키보드 적응 완료!',
      descClass: 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200',
      desc: `👍 빠른 속도 (평균 ${avgSpeed.toFixed(1)}초): 손가락 위치가 눈에 익고 있습니다! 매일 2분씩 진행하면 목표인 1.5초 이내 자동반사 단계에 완전히 진입합니다.`,
    };
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-8">
      <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-center space-y-4 shadow-2xl backdrop-blur-md">
        <div className="text-5xl animate-bounce">{evalConfig.emoji}</div>

        <div>
          <span
            className={`text-xs px-3.5 py-1 rounded-full border font-bold ${evalConfig.badgeClass}`}
          >
            {evalConfig.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-jua text-white mt-2">
            {evalConfig.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">오늘의 연산 속도 및 정확도 평가 결과입니다.</p>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700/80 text-left">
          <div className="p-1.5">
            <div className="text-[11px] text-slate-400">평균 문항 속도</div>
            <div className="text-xl font-black text-indigo-400 font-jua mt-0.5">
              {avgSpeed > 0 ? `${avgSpeed.toFixed(2)}초` : '-'}
            </div>
          </div>
          <div className="p-1.5 border-x border-slate-800">
            <div className="text-[11px] text-slate-400">맞힌 문제</div>
            <div className="text-xl font-black text-emerald-400 font-jua mt-0.5">
              {correctCount}문항
            </div>
          </div>
          <div className="p-1.5">
            <div className="text-[11px] text-slate-400">정답률</div>
            <div className="text-xl font-black text-amber-400 font-jua mt-0.5">{accuracy}%</div>
          </div>
        </div>

        {/* Speed Evaluation Box */}
        <div className={`p-4 rounded-2xl border text-left text-xs leading-relaxed ${evalConfig.descClass}`}>
          {evalConfig.desc}
        </div>

        {/* Weak Table Advice */}
        <div className="bg-slate-900/60 p-3.5 rounded-2xl text-xs text-left border border-slate-800 space-y-1">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            분석 및 보완점:
          </span>
          <p className="text-slate-400 leading-relaxed">
            {slowestTable && slowestTime > 1.8 ? (
              <>
                <strong className="text-amber-300 font-extrabold">{slowestTable}단</strong>의 반응 속도(평균{' '}
                {slowestTime.toFixed(1)}초)가 다른 단에 비해 조금 느립니다. 2단계의 해당 단을
                집중 연습해보세요!
              </>
            ) : (
              '모든 단에서 치우침 없이 빠르고 고른 반응 속도를 보여주었습니다!'
            )}
          </p>
        </div>

        {/* Firebase DB Registration Badge */}
        {student && (
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                학습자 <strong>{student.nickname}</strong>의 기록이 Firebase에 등록되었습니다!
              </span>
            </div>
            {saveStatus === 'saving' && (
              <span className="text-[11px] text-slate-400">저장 중...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                저장 완료
              </span>
            )}
          </div>
        )}

        {/* Prominent Hall of Fame Button */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => {
              playSound('click');
              onGoToLeaderboard();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-slate-950" />
            <span className="text-sm font-jua tracking-wide">🏆 실시간 명예의 전당에서 내 순위 확인하기</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                playSound('click');
                onPlayAgain();
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-2xl font-bold text-white text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>다시 도전</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                onGoToMenu();
              }}
              className="px-5 bg-slate-700 hover:bg-slate-600 py-3 rounded-2xl font-bold text-slate-200 hover:text-white text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>메뉴로</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
