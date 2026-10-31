import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ModeSelectScreen } from './components/ModeSelectScreen';
import { GameScreen, GameMode, GameResultData } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { LeaderboardView } from './components/LeaderboardView';
import {
  StudentProfile,
  getStoredStudent,
  setStoredStudent,
} from './services/studentService';
import { isSoundEnabled, toggleSound, playSound } from './utils/sound';

type AppView = 'auth' | 'select' | 'game' | 'result' | 'leaderboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>('speedrun');
  const [lastResult, setLastResult] = useState<GameResultData | null>(null);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Initialize student session & streak
  useEffect(() => {
    const saved = getStoredStudent();
    if (saved) {
      setStudent(saved);
      setCurrentView('select');
    } else {
      setCurrentView('auth');
    }

    // Attendance streak
    try {
      const lastDate = localStorage.getItem('gugudan_last_date');
      const savedStreak = parseInt(localStorage.getItem('gugudan_streak') || '0', 10);
      setStreak(savedStreak);

      const today = new Date().toDateString();
      if (lastDate !== today) {
        const nextStreak = savedStreak === 0 ? 1 : savedStreak;
        setStreak(nextStreak);
        localStorage.setItem('gugudan_streak', nextStreak.toString());
        localStorage.setItem('gugudan_last_date', today);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleAuthSuccess = (loggedStudent: StudentProfile) => {
    setStudent(loggedStudent);
    setShowAuthModal(false);
    setCurrentView('select');
  };

  const handleLogout = () => {
    setStoredStudent(null);
    setStudent(null);
    setCurrentView('auth');
  };

  const handleStartMode = (mode: GameMode) => {
    setCurrentMode(mode);
    setCurrentView('game');
  };

  const handleGameFinish = (result: GameResultData) => {
    setLastResult(result);
    setCurrentView('result');

    // Update streak on game complete
    try {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem('gugudan_last_date');
      let currentStreakVal = parseInt(localStorage.getItem('gugudan_streak') || '1', 10);
      if (lastDate !== today) {
        currentStreakVal += 1;
        localStorage.setItem('gugudan_streak', currentStreakVal.toString());
        localStorage.setItem('gugudan_last_date', today);
        setStreak(currentStreakVal);
      }
    } catch {
      // ignore
    }
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundActive(newState);
    if (newState) {
      playSound('click');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        student={student}
        soundEnabled={soundActive}
        onToggleSound={handleSoundToggle}
        streak={streak}
        onOpenLeaderboard={() => {
          setCurrentView('leaderboard');
        }}
        onOpenAuth={() => {
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
        onGoHome={() => {
          if (student) setCurrentView('select');
          else setCurrentView('auth');
        }}
      />

      {/* Main View Area */}
      <main className="w-full max-w-xl mx-auto px-4 py-5 flex-1 flex flex-col justify-center">
        {/* Auth View (First Screen when not logged in) */}
        {currentView === 'auth' && (
          <div className="space-y-4">
            <AuthScreen
              onSuccess={handleAuthSuccess}
              isModal={false}
            />
            <div className="text-center">
              <button
                onClick={() => {
                  playSound('click');
                  setCurrentView('select');
                }}
                className="text-xs text-slate-400 hover:text-indigo-300 underline underline-offset-4 transition cursor-pointer"
              >
                가입 없이 게스트로 먼저 문제 풀어보기 ➔
              </button>
            </div>
          </div>
        )}

        {/* Mode Selection Screen */}
        {currentView === 'select' && (
          <ModeSelectScreen
            student={student}
            onSelectMode={handleStartMode}
            onOpenLeaderboard={() => setCurrentView('leaderboard')}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* Game Active Screen */}
        {currentView === 'game' && (
          <GameScreen
            mode={currentMode}
            onFinish={handleGameFinish}
            onQuit={() => setCurrentView('select')}
          />
        )}

        {/* Game Result Screen */}
        {currentView === 'result' && lastResult && (
          <ResultScreen
            result={lastResult}
            student={student}
            onGoToLeaderboard={() => setCurrentView('leaderboard')}
            onPlayAgain={() => setCurrentView('game')}
            onGoToMenu={() => setCurrentView('select')}
          />
        )}

        {/* Hall of Fame / Leaderboard Screen */}
        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentNickname={student?.nickname}
            onBackToMenu={() => {
              if (student) setCurrentView('select');
              else setCurrentView('auth');
            }}
            onPlayAgain={(mode) => {
              if (mode) setCurrentMode(mode as GameMode);
              setCurrentView('game');
            }}
          />
        )}
      </main>

      {/* Floating Auth Modal when requested from other screens */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AuthScreen
              onSuccess={handleAuthSuccess}
              onCancel={() => setShowAuthModal(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="w-full max-w-xl mx-auto px-4 py-3 text-center text-xs text-slate-500 border-t border-slate-800">
        매일 2분 구구단 자동반사 훈련으로 5학년 수학에 자신감을 높여보세요!
      </footer>
    </div>
  );
}
