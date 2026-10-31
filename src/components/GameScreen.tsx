import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { playSound } from '../utils/sound';

export type GameMode = 'stage1' | 'table_easy' | 'table_hard' | 'speedrun' | 'reverse' | 'table_single';

export interface GameResultData {
  mode: GameMode;
  modeTitle: string;
  totalSolved: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  avgSpeed: number;
  tableTimes: { [table: number]: number[] };
}

interface GameScreenProps {
  mode: GameMode;
  targetTable?: number;
  studentNickname?: string;
  onFinish: (result: GameResultData) => void;
  onQuit: () => void;
  onBadgeEarned?: (badgeId: string) => void;
}

interface Problem {
  questionStr: string;
  targetAnswer?: string;
  validAnswers?: string[];
  a: number;
  b: number;
  isReverse: boolean;
  rawProduct?: number;
}

const VALID_REVERSE_PRODUCTS = [
  4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28,
  30, 32, 35, 36, 40, 42, 45, 48, 49, 54, 56, 63, 64, 72, 81,
];

function getValidFactors(prod: number): string[] {
  const pairs: string[] = [];
  for (let i = 1; i <= 9; i++) {
    if (prod % i === 0) {
      const j = prod / i;
      if (j >= 1 && j <= 9) {
        pairs.push(`${i}${j}`);
        pairs.push(`${i}*${j}`);
        pairs.push(`${i}x${j}`);
        pairs.push(`${i}X${j}`);
      }
    }
  }
  return pairs;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  targetTable = 7,
  studentNickname,
  onFinish,
  onQuit,
  onBadgeEarned,
}) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [totalSolved, setTotalSolved] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState('0.0초');
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const problemStartTimeRef = useRef<number>(Date.now());
  const isProcessingRef = useRef<boolean>(false);
  const tableTimesRef = useRef<{ [key: number]: number[] }>({});
  const tableStreakRef = useRef<{ [key: number]: number }>({});
  const problemHistoryRef = useRef<string[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize table times
  useEffect(() => {
    tableTimesRef.current = {};
    tableStreakRef.current = {};
    for (let i = 2; i <= 9; i++) {
      tableTimesRef.current[i] = [];
      tableStreakRef.current[i] = 0;
    }
  }, []);

  const getModeTitle = (m: GameMode): string => {
    switch (m) {
      case 'stage1':
        return '⌨️ 1단계: 키보드 적응 & 기초 연습';
      case 'table_easy':
        return '🌱 2단계: 2~5단 기초 집중';
      case 'table_hard':
        return '🔥 2단계: 6~9단 고난도 집중';
      case 'speedrun':
        return '⚡ 3단계: 5학년 실전 스피드런';
      case 'reverse':
        return '🔍 4단계: 거꾸로 구구단 (약수)';
      case 'table_single':
        return `🎯 ${targetTable}단 10문제 마스터 챌린지`;
    }
  };

  const isCountDown = mode === 'speedrun' || mode === 'reverse';

  const calculateOverallAvgSpeed = useCallback((): number => {
    let allTimes: number[] = [];
    for (const t in tableTimesRef.current) {
      allTimes = allTimes.concat(tableTimesRef.current[t]);
    }
    if (allTimes.length === 0) return 0;
    const sum = allTimes.reduce((acc, curr) => acc + curr, 0);
    return sum / allTimes.length;
  }, []);

  const handleFinish = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    playSound('finish');

    const totalAttempts = correctCount + wrongCount;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
    const avgSpeed = Number(calculateOverallAvgSpeed().toFixed(2));

    if (mode === 'speedrun' && avgSpeed > 0 && avgSpeed <= 1.5 && accuracy >= 90) {
      onBadgeEarned?.('badge_speedrun_15');
    }

    onFinish({
      mode,
      modeTitle: getModeTitle(mode),
      totalSolved,
      correctCount,
      wrongCount,
      accuracy,
      avgSpeed,
      tableTimes: { ...tableTimesRef.current },
    });
  }, [calculateOverallAvgSpeed, correctCount, mode, onBadgeEarned, onFinish, totalSolved, wrongCount]);

  const generateProblem = useCallback((): Problem => {
    let minA = 2, maxA = 9;
    let minB = 2, maxB = 9;

    if (mode === 'table_single' && targetTable) {
      minA = targetTable;
      maxA = targetTable;
      minB = 1;
      maxB = 9;
    } else if (mode === 'table_easy') {
      minA = 2; maxA = 5;
    } else if (mode === 'table_hard') {
      minA = 6; maxA = 9;
    }

    let a: number, b: number, key: string, product: number;
    let maxAttempts = 30;

    if (mode === 'reverse') {
      do {
        product = VALID_REVERSE_PRODUCTS[Math.floor(Math.random() * VALID_REVERSE_PRODUCTS.length)];
        key = `rev_${product}`;
        maxAttempts--;
      } while (problemHistoryRef.current.includes(key) && maxAttempts > 0);

      problemHistoryRef.current.push(key);
      if (problemHistoryRef.current.length > 12) problemHistoryRef.current.shift();

      return {
        questionStr: `? × ? = ${product}`,
        validAnswers: getValidFactors(product),
        a: product,
        b: product,
        isReverse: true,
        rawProduct: product,
      };
    } else {
      do {
        a = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
        b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
        key = `${a}x${b}`;
        maxAttempts--;
      } while (problemHistoryRef.current.includes(key) && maxAttempts > 0);

      problemHistoryRef.current.push(key);
      if (problemHistoryRef.current.length > 12) problemHistoryRef.current.shift();

      return {
        questionStr: `${a} × ${b} = ?`,
        targetAnswer: (a * b).toString(),
        a,
        b,
        isReverse: false,
      };
    }
  }, [mode]);

  const nextProblem = useCallback(() => {
    const nextP = generateProblem();
    setProblem(nextP);
    setUserInput('');
    isProcessingRef.current = false;
    problemStartTimeRef.current = Date.now();
  }, [generateProblem]);

  // Start game loop
  useEffect(() => {
    nextProblem();

    if (isCountDown) {
      setTimeRemaining(120);
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setElapsedSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isCountDown, nextProblem]);

  // Handle countdown finish
  useEffect(() => {
    if (isCountDown && timeRemaining <= 0) {
      handleFinish();
    }
  }, [isCountDown, timeRemaining, handleFinish]);

  const checkAnswer = useCallback(
    (inputToCheck: string) => {
      if (!problem || isProcessingRef.current) return;
      isProcessingRef.current = true;

      const timeTaken = (Date.now() - problemStartTimeRef.current) / 1000;
      let isCorrect = false;

      if (problem.isReverse) {
        if (problem.validAnswers && problem.validAnswers.includes(inputToCheck)) {
          isCorrect = true;
        }
      } else {
        if (inputToCheck === problem.targetAnswer) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        playSound('correct');
        setTotalSolved((prev) => prev + 1);
        setCorrectCount((prev) => prev + 1);

        if (problem.a >= 2 && problem.a <= 9) {
          if (!tableTimesRef.current[problem.a]) tableTimesRef.current[problem.a] = [];
          tableTimesRef.current[problem.a].push(timeTaken);

          // Track consecutive correct answers for this table
          const currentTableStreak = (tableStreakRef.current[problem.a] || 0) + 1;
          tableStreakRef.current[problem.a] = currentTableStreak;
          setConsecutiveStreak(currentTableStreak);

          // 10 consecutive correct answers on this table unlocks the Master Badge!
          if (currentTableStreak === 10) {
            onBadgeEarned?.(`badge_table_${problem.a}`);
            if (mode === 'table_single') {
              setTimeout(() => {
                handleFinish();
              }, 400);
              return;
            }
          }
        }

        if (mode === 'stage1' && correctCount + 1 >= 10) {
          onBadgeEarned?.('badge_keyboard_master');
        }
        if (mode === 'reverse' && correctCount + 1 >= 10) {
          onBadgeEarned?.('badge_reverse_master');
        }

        const avg = calculateOverallAvgSpeed();
        setLiveSpeed(`${avg.toFixed(1)}초`);

        setFeedback({
          text: `⭕ 정답! (${timeTaken.toFixed(1)}초)`,
          isCorrect: true,
        });

        setTimeout(() => {
          setFeedback(null);
          nextProblem();
        }, 180);
      } else {
        playSound('wrong');
        setWrongCount((prev) => prev + 1);

        if (problem.a >= 2 && problem.a <= 9) {
          tableStreakRef.current[problem.a] = 0;
          setConsecutiveStreak(0);
        }

        let hintText = `❌ 오답! 정답: ${problem.targetAnswer}`;
        if (problem.isReverse && problem.validAnswers && problem.validAnswers.length > 0) {
          const sample = problem.validAnswers[0];
          hintText = `❌ 오답! ${problem.rawProduct}는 ${sample[0]} × ${sample[1]} = ${problem.rawProduct}`;
        } else if (!problem.isReverse && problem.b > 1) {
          const prevMultiple = problem.a * (problem.b - 1);
          hintText = `❌ 오답! 💡 ${problem.a}×${problem.b}은 ${problem.a}×${problem.b - 1}(${prevMultiple}) + ${problem.a} = ${problem.targetAnswer}!`;
        }

        setFeedback({
          text: hintText,
          isCorrect: false,
        });

        setTimeout(() => {
          setFeedback(null);
          setUserInput('');
          isProcessingRef.current = false;
        }, 900);
      }
    },
    [calculateOverallAvgSpeed, nextProblem, problem]
  );

  const pressNum = useCallback(
    (digit: string) => {
      if (isProcessingRef.current || !problem) return;
      playSound('click');
      setActiveKey(digit);
      setTimeout(() => setActiveKey(null), 120);

      const nextInput = userInput + digit;
      if (nextInput.length > 4) return;
      setUserInput(nextInput);

      if (!problem.isReverse) {
        if (problem.targetAnswer && nextInput.length === problem.targetAnswer.length) {
          checkAnswer(nextInput);
        }
      } else {
        if (nextInput.length === 2) {
          checkAnswer(nextInput);
        }
      }
    },
    [checkAnswer, problem, userInput]
  );

  const pressClear = useCallback(() => {
    if (isProcessingRef.current) return;
    playSound('click');
    setActiveKey('clear');
    setTimeout(() => setActiveKey(null), 120);
    setUserInput('');
  }, []);

  const pressSubmit = useCallback(() => {
    if (isProcessingRef.current) return;
    setActiveKey('enter');
    setTimeout(() => setActiveKey(null), 120);
    if (userInput.length > 0) {
      checkAnswer(userInput);
    }
  }, [checkAnswer, userInput]);

  // Global Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        pressNum(e.key);
      } else if (e.key === 'Enter') {
        pressSubmit();
      } else if (e.key === 'Backspace') {
        pressClear();
      } else if (e.key === 'Escape') {
        onQuit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuit, pressClear, pressNum, pressSubmit]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-3.5">
      {/* Top Bar with Stage, Timer, and Speed - Single line layout */}
      <div className="bg-slate-800/90 p-2.5 sm:p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-lg whitespace-nowrap">
        <div className="shrink-0">
          <span className="text-[11px] text-slate-400 block leading-tight">
            {mode === 'table_single' ? '연속 정답' : '진행 문제'}
          </span>
          <div className="font-bold text-slate-100 text-sm flex items-center gap-1 mt-0.5">
            {mode === 'table_single' ? (
              <>
                <span className="text-amber-400 font-extrabold font-jua text-base">{consecutiveStreak}</span>
                <span className="text-slate-400 text-xs">/ 10연속</span>
              </>
            ) : (
              <>
                해결: <span className="text-emerald-400 font-extrabold">{correctCount}</span>개
              </>
            )}
          </div>
        </div>

        <div className="text-center shrink-0 px-2">
          <span className="text-[11px] text-slate-400 block leading-tight">
            {isCountDown ? '남은 시간' : '경과 시간'}
          </span>
          <div
            className={`font-black text-xl font-jua leading-tight mt-0.5 ${
              isCountDown && timeRemaining <= 15 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            {formatTimer(isCountDown ? timeRemaining : elapsedSeconds)}
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-400 block leading-tight">평균 속도</span>
          <div className="font-extrabold text-indigo-400 text-sm mt-0.5">{liveSpeed}</div>
        </div>
      </div>

      {/* Problem Card */}
      <div
        className={`relative bg-slate-800 border-2 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center justify-center min-h-[190px] transition-all duration-200 ${
          feedback?.isCorrect
            ? 'border-emerald-500/90 shadow-emerald-500/20'
            : feedback?.isCorrect === false
            ? 'border-rose-500/90 shadow-rose-500/20 animate-shake'
            : 'border-indigo-500/40'
        }`}
      >
        <div className="absolute top-3 left-4 text-[10px] bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-700/60 shadow">
          {getModeTitle(mode)}
        </div>

        {/* Feedback Alert */}
        <div className="h-5 flex items-center justify-center mb-1">
          {feedback ? (
            <span
              className={`text-xs font-black animate-pop ${
                feedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {feedback.text}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              {mode === 'reverse'
                ? '💡 두 한 자리 숫자를 연속으로 입력하세요'
                : '키보드 오른쪽 넘버패드로 입력하세요'}
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="text-4xl sm:text-5xl font-black text-white font-jua tracking-wider my-2 flex items-center justify-center gap-3">
          <span>{problem?.questionStr || '...'}</span>
        </div>

        {/* Input Box Display */}
        <div className="mt-2 h-11 flex items-center justify-center">
          <div
            className={`min-w-[130px] px-5 py-1.5 rounded-xl text-2xl font-black tracking-widest text-center min-h-[44px] transition-all flex items-center justify-center ${
              userInput
                ? 'bg-indigo-950/80 border-2 border-indigo-400 text-indigo-200 shadow-md'
                : 'bg-slate-900 border border-slate-700 text-slate-600'
            }`}
          >
            {userInput || ' '}
          </div>
        </div>
      </div>

      {/* On-Screen Virtual Numpad */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-2">
          {mode === 'stage1' ? (
            <span className="text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-600/40">
              💡 5번 키(가운데)에 손가락을 올리고 천천히 위치를 익혀보세요!
            </span>
          ) : (
            <span>⌨️ 키보드 오른쪽 숫자패드(0~9, Enter, Backspace) 지원</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((num) => {
            const isHomeKey = num === '5' && mode === 'stage1';
            return (
              <button
                key={num}
                onClick={() => pressNum(num)}
                className={`key-btn relative bg-slate-800 hover:bg-slate-700 border py-3.5 rounded-2xl text-xl font-black text-white transition active:scale-95 shadow-md cursor-pointer ${
                  isHomeKey
                    ? 'border-amber-400 ring-2 ring-amber-500/30'
                    : 'border-slate-700'
                } ${activeKey === num ? 'key-active' : ''}`}
              >
                {num}
                {isHomeKey && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-300">
                    기준점
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={pressClear}
            className={`key-btn bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 py-3.5 rounded-2xl text-xs font-bold text-rose-300 transition active:scale-95 cursor-pointer ${
              activeKey === 'clear' ? 'key-active' : ''
            }`}
          >
            지우기
          </button>
          <button
            onClick={() => pressNum('0')}
            className={`key-btn bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3.5 rounded-2xl text-xl font-black text-white transition active:scale-95 shadow-md cursor-pointer ${
              activeKey === '0' ? 'key-active' : ''
            }`}
          >
            0
          </button>
          <button
            onClick={pressSubmit}
            className={`key-btn bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 py-3.5 rounded-2xl text-sm font-black text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer ${
              activeKey === 'enter' ? 'key-active' : ''
            }`}
          >
            확인
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={() => {
            playSound('click');
            onQuit();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-bold text-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>메뉴로 돌아가기</span>
        </button>

        {!isCountDown && (
          <button
            onClick={() => {
              handleFinish();
            }}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <span>연습 종료 & 결과 보기</span>
          </button>
        )}

        <span className="text-[11px] text-slate-500">
          <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">ESC</kbd> 메뉴
        </span>
      </div>
    </div>
  );
};
