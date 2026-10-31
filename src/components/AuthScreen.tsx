import React, { useState } from 'react';
import { Sparkles, User, Lock, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { registerStudent, loginStudent, StudentProfile } from '../services/studentService';
import { playSound } from '../utils/sound';

interface AuthScreenProps {
  onSuccess: (student: StudentProfile) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onCancel, isModal = false }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    playSound('click');

    const cleanNick = nickname.trim();
    if (!cleanNick) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (cleanNick.length < 2 || cleanNick.length > 15) {
      setError('닉네임은 2자 이상 15자 이하로 정해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 4) {
      setError('비밀번호는 4자리 이상이어야 합니다.');
      return;
    }

    if (mode === 'register' && confirmPassword && password !== confirmPassword) {
      setError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      let student: StudentProfile;
      if (mode === 'register') {
        student = await registerStudent(cleanNick, password);
      } else {
        student = await loginStudent(cleanNick, password);
      }
      playSound('correct');
      onSuccess(student);
    } catch (err: unknown) {
      playSound('wrong');
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${isModal ? 'p-0' : 'px-4 py-8'}`}>
      <div className="bg-slate-800/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-jua">
            {mode === 'register' ? '간편 학습자 회원가입' : '학습자 로그인'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            {mode === 'register'
              ? '닉네임과 비밀번호만 설정하면 점수가 명예의 전당에 기록됩니다!'
              : '등록한 닉네임과 비밀번호로 로그인하세요.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-5 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>새로 회원가입</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>기존 로그인</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              학생 닉네임 <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 번개연산왕, 5학년수학마스터"
                maxLength={15}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">2~15자의 닉네임을 사용하세요.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              비밀번호 <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="간편 4자리 이상 (예: 1234)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                disabled={isLoading}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 다시 입력"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                처리 중...
              </span>
            ) : (
              <>
                <span>{mode === 'register' ? '회원가입 완료 & 시작' : '로그인하고 시작'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {isModal && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              닫기
            </button>
          )}
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            💡 이메일이나 개인정보 없이 닉네임과 비밀번호만으로 안전하게 학습할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
