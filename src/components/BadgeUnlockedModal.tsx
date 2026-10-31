import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, ArrowRight, X } from 'lucide-react';
import { BadgeDefinition } from '../services/badgeService';
import { playSound } from '../utils/sound';

interface BadgeUnlockedModalProps {
  badge: BadgeDefinition;
  onClose: () => void;
  onViewAllBadges: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  badge,
  onClose,
  onViewAllBadges,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });
    playSound('fanfare');
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400/80 rounded-3xl p-6 text-center shadow-2xl shadow-amber-500/20 relative animate-pop">
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badge Highlight */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>새로운 배지 획득!</span>
        </div>

        {/* Big Badge Icon */}
        <div className="my-3 flex justify-center">
          <div
            className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${badge.colorClass} flex items-center justify-center text-5xl shadow-xl shadow-amber-500/30 border-2 border-white/30 animate-bounce`}
          >
            {badge.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white font-jua tracking-wide">
          {badge.name}
        </h3>
        <p className="text-xs text-amber-300 font-bold mt-1">
          {badge.requirement} 달성 완료!
        </p>

        {/* Description */}
        <div className="bg-slate-900/80 border border-slate-700/80 p-3 rounded-2xl my-4 text-xs text-slate-300 leading-relaxed">
          {badge.description}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              playSound('click');
              onViewAllBadges();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>내 배지 도감에서 확인하기</span>
          </button>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            닫기 & 계속 연습하기
          </button>
        </div>
      </div>
    </div>
  );
};
