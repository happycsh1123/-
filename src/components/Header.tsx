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
  onLogout,
  onGoHome,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto px-4 pt-4 pb-2.5 flex items-center justify-between border-b border-slate-800">
      {/* Brand Logo & Title */}
      <button
        onClick={() => {
          playSound('click');
          onGoHome();
        }}
        className="flex items-center gap-2 text-left group cursor-pointer"
      >
        <span className="text-2xl group-hover:scale-110 transition">⚡</span>
        <div>
          <h1 className="text-lg font-bold font-jua text-indigo-400 group-hover:text-indigo-300 leading-none transition">
            구구단 스피드 마스터
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">키보드 적응부터 5학년 완벽 대비까지</p>
        </div>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Hall of Fame Button */}
        <button
          onClick={() => {
            playSound('click');
            onOpenLeaderboard();
          }}
          title="명예의 전당 보기"
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-sm"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">명예의 전당</span>
        </button>

        {/* Streak badge */}
        <div className="bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-extrabold text-amber-300">{streak}일</span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
          }}
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
          className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User account badge / login button */}
        {student ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playSound('click');
                onOpenAuth();
              }}
              className="bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
              title="계정 정보 / 다른 계정 로그인"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[70px] truncate">{student.nickname}</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                onLogout();
              }}
              title="로그아웃"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playSound('click');
              onOpenAuth();
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
};
