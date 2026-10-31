import React from 'react';
import { Volume2, VolumeX, Trophy, User, LogOut, Flame } from 'lucide-react';
import { StudentProfile } from '../services/studentService';
import { playSound, toggleSound } from '../utils/sound';

interface HeaderProps {
  student: StudentProfile | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  streak: number;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenBadges?: () => void;
  onLogout: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  soundEnabled,
  onToggleSound,
  streak,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenBadges,
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border-b border-slate-800 gap-1 sm:gap-2 flex-nowrap whitespace-nowrap overflow-x-hidden">
      {/* Brand Logo & Title (Single line, no subtitle) */}
      <button
        onClick={() => {
          playSound('click');
          onGoHome();
        }}
        className="flex items-center gap-1 sm:gap-1.5 text-left group cursor-pointer shrink-0"
      >
        <span className="text-xl sm:text-2xl group-hover:scale-110 transition shrink-0">⚡</span>
        <h1 className="text-sm sm:text-base font-bold font-jua text-indigo-400 group-hover:text-indigo-300 leading-none transition whitespace-nowrap">
          구구단 스피드 마스터
        </h1>
      </button>

      {/* Right Controls - Strictly single line */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
        {/* Badge Showcase Button */}
        {student && onOpenBadges && (
          <button
            onClick={() => {
              playSound('click');
              onOpenBadges();
            }}
            title="마스터 배지 도감"
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
          >
            <span className="text-xs sm:text-sm">🏅</span>
            <span className="font-mono text-[11px] sm:text-xs">{student.badges?.length || 0}</span>
          </button>
        )}

        {/* Hall of Fame Button */}
        <button
          onClick={() => {
            playSound('click');
            onOpenLeaderboard();
          }}
          title="명예의 전당 보기"
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] sm:text-xs">명예의 전당</span>
        </button>

        {/* Streak badge */}
        <div className="bg-slate-800 px-1.5 sm:px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs shrink-0">
          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span className="font-extrabold text-amber-300 text-[11px] sm:text-xs">{streak}일</span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
          }}
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
          className="bg-slate-800 hover:bg-slate-700 p-1 sm:p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {/* User account badge / login button */}
        {student ? (
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={() => {
                playSound('click');
                onOpenAuth();
              }}
              className="bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-indigo-200 flex items-center gap-1 transition cursor-pointer shrink-0"
              title="계정 정보 / 다른 계정 로그인"
            >
              <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              <span className="max-w-[45px] sm:max-w-[70px] truncate text-[11px] sm:text-xs">{student.nickname}</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                onLogout();
              }}
              title="로그아웃"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition cursor-pointer shrink-0"
            >
              <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playSound('click');
              onOpenAuth();
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold shadow-md transition active:scale-95 cursor-pointer shrink-0"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
};
