import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ModeSelectScreen } from './components/ModeSelectScreen';
import { GameScreen, GameMode, GameResultData } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgeShowcaseModal } from './components/BadgeShowcaseModal';
import { BadgeUnlockedModal } from './components/BadgeUnlockedModal';
import {
  StudentProfile,
  getStoredStudent,
  setStoredStudent,
  updateStudentStreak,
} from './services/studentService';
import { BadgeDefinition, awardBadgeToStudent } from './services/badgeService';
import { isSoundEnabled, toggleSound, playSound } from './utils/sound';

type AppView = 'auth' | 'select' | 'game' | 'result' | 'leaderboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>('speedrun');
  const [selectedTable, setSelectedTable] = useState<number>(7);
  const [lastResult, setLastResult] = useState<GameResultData | null>(null);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showBadgeModal, setShowBadgeModal] = useState<boolean>(false);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeDefinition | null>(null);

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
        const nextStreak = savedStreak === 0 ? 1 : savedStreak + 1;
        setStreak(nextStreak);
        localStorage.setItem('gugudan_streak', nextStreak.toString());
        localStorage.setItem('gugudan_last_date', today);

        if (saved) {
          updateStudentStreak(saved.nickname, nextStreak);
        }
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

  const handleStartMode = (mode: GameMode, targetTable?: number) => {
    setCurrentMode(mode);
    if (targetTable) {
      setSelectedTable(targetTable);
    }
    setCurrentView('game');
  };

  const handleBadgeEarned = async (badgeId: string) => {
    if (!student || !student.nickname) return;
    try {
      const { newlyAwarded, badge } = await awardBadgeToStudent(student.nickname, badgeId);
      if (newlyAwarded && badge) {
        setUnlockedBadge(badge);
        // Refresh local student
        const fresh = getStoredStudent();
        if (fresh) setStudent(fresh);
      }
    } catch (err) {
      console.warn('Error awarding badge:', err);
    }
  };

  const handleGameFinish = (result: GameResultData) => {
    setLastResult(result);
    setCurrentView('result');

    // Refresh stored student object for updated solved count, speed, and badges
    const updated = getStoredStudent();
    if (updated) {
      setStudent(updated);
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
        onOpenBadges={() => {
          setShowBadgeModal(true);
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
            onOpenBadges={() => setShowBadgeModal(true)}
          />
        )}

        {/* Game Active Screen */}
        {currentView === 'game' && (
          <GameScreen
            mode={currentMode}
            targetTable={selectedTable}
            studentNickname={student?.nickname}
            onFinish={handleGameFinish}
            onQuit={() => setCurrentView('select')}
            onBadgeEarned={handleBadgeEarned}
          />
        )}

        {/* Game Result Screen */}
        {currentView === 'result' && lastResult && (
          <ResultScreen
            result={lastResult}
            student={student}
            onGoToLeaderboard={() => {
              const fresh = getStoredStudent();
              if (fresh) setStudent(fresh);
              setCurrentView('leaderboard');
            }}
            onPlayAgain={() => setCurrentView('game')}
            onGoToMenu={() => {
              const fresh = getStoredStudent();
              if (fresh) setStudent(fresh);
              setCurrentView('select');
            }}
          />
        )}

        {/* Hall of Fame / Leaderboard Screen */}
        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentNickname={student?.nickname}
            currentStudentSolved={student?.totalSolved}
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

      {/* Badge Showcase Modal */}
      {showBadgeModal && (
        <BadgeShowcaseModal
          student={student}
          onClose={() => setShowBadgeModal(false)}
          onStartTableChallenge={(tableNum) => {
            setShowBadgeModal(false);
            handleStartMode('table_single', tableNum);
          }}
        />
      )}

      {/* Badge Unlocked Celebration Modal */}
      {unlockedBadge && (
        <BadgeUnlockedModal
          badge={unlockedBadge}
          onClose={() => setUnlockedBadge(null)}
          onViewAllBadges={() => {
            setUnlockedBadge(null);
            setShowBadgeModal(true);
          }}
        />
      )}

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
