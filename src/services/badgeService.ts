import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { StudentProfile, getStoredStudent, setStoredStudent } from './studentService';

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  category: 'table' | 'achievement' | 'special';
  tableNumber?: number;
  description: string;
  requirement: string;
  colorClass: string;
  borderClass: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    id: 'badge_table_2',
    name: '2단 마스터',
    icon: '🌱',
    category: 'table',
    tableNumber: 2,
    description: '구구단의 첫걸음! 2단의 모든 문제를 능숙하게 풀어냈습니다.',
    requirement: '2단 10문제 연속 정답',
    colorClass: 'from-emerald-600 to-teal-700 text-emerald-200',
    borderClass: 'border-emerald-500/50 shadow-emerald-500/20',
  },
  {
    id: 'badge_table_3',
    name: '3단 마스터',
    icon: '🌱',
    category: 'table',
    tableNumber: 3,
    description: '3단 곱셈을 완벽하게 마스터했습니다.',
    requirement: '3단 10문제 연속 정답',
    colorClass: 'from-emerald-600 to-teal-700 text-emerald-200',
    borderClass: 'border-emerald-500/50 shadow-emerald-500/20',
  },
  {
    id: 'badge_table_4',
    name: '4단 마스터',
    icon: '🌱',
    category: 'table',
    tableNumber: 4,
    description: '2단의 2배수 원리를 이해하고 4단을 정복했습니다.',
    requirement: '4단 10문제 연속 정답',
    colorClass: 'from-teal-600 to-cyan-700 text-teal-200',
    borderClass: 'border-teal-500/50 shadow-teal-500/20',
  },
  {
    id: 'badge_table_5',
    name: '5단 마스터',
    icon: '🌱',
    category: 'table',
    tableNumber: 5,
    description: '끝자리 0과 5의 규칙을 꿰뚫고 5단을 마스터했습니다.',
    requirement: '5단 10문제 연속 정답',
    colorClass: 'from-cyan-600 to-blue-700 text-cyan-200',
    borderClass: 'border-cyan-500/50 shadow-cyan-500/20',
  },
  {
    id: 'badge_table_6',
    name: '6단 마스터',
    icon: '🔥',
    category: 'table',
    tableNumber: 6,
    description: '고난도 구구단의 관문 6단을 거침없이 격파했습니다.',
    requirement: '6단 10문제 연속 정답',
    colorClass: 'from-orange-600 to-amber-700 text-orange-200',
    borderClass: 'border-orange-500/50 shadow-orange-500/20',
  },
  {
    id: 'badge_table_7',
    name: '7단 마스터',
    icon: '⚡',
    category: 'table',
    tableNumber: 7,
    description: '5학년 학생들이 가장 헷갈려하는 마의 7단을 완벽히 지배했습니다!',
    requirement: '7단 10문제 연속 정답',
    colorClass: 'from-amber-600 to-yellow-600 text-amber-200',
    borderClass: 'border-amber-400/80 shadow-amber-500/30 ring-1 ring-amber-400',
  },
  {
    id: 'badge_table_8',
    name: '8단 마스터',
    icon: '🔥',
    category: 'table',
    tableNumber: 8,
    description: '큰 숫자 연산도 두렵지 않은 8단의 고수가 되었습니다.',
    requirement: '8단 10문제 연속 정답',
    colorClass: 'from-rose-600 to-red-700 text-rose-200',
    borderClass: 'border-rose-500/50 shadow-rose-500/20',
  },
  {
    id: 'badge_table_9',
    name: '9단 마스터',
    icon: '🌟',
    category: 'table',
    tableNumber: 9,
    description: '자릿수 합이 9가 되는 신비한 9단까지 올 클리어!',
    requirement: '9단 10문제 연속 정답',
    colorClass: 'from-purple-600 to-indigo-700 text-purple-200',
    borderClass: 'border-purple-500/50 shadow-purple-500/20',
  },
  {
    id: 'badge_speedrun_15',
    name: '1.5초 번개 마스터',
    icon: '⚡',
    category: 'achievement',
    description: '5학년 실전 스피드런에서 평균 1.5초 이내 자동반사를 완성했습니다.',
    requirement: '스피드런 평균 1.5초 이내 달성',
    colorClass: 'from-indigo-600 to-blue-600 text-indigo-200',
    borderClass: 'border-indigo-400/70 shadow-indigo-500/30',
  },
  {
    id: 'badge_reverse_master',
    name: '약수 탐정 마스터',
    icon: '🔍',
    category: 'achievement',
    description: '결과를 보고 약수 곱을 즉시 찾아내 약분·통분 대비를 끝냈습니다.',
    requirement: '거꾸로 구구단 10문제 정답',
    colorClass: 'from-amber-600 to-purple-700 text-amber-200',
    borderClass: 'border-amber-500/50 shadow-amber-500/20',
  },
  {
    id: 'badge_keyboard_master',
    name: '키보드 타자 달인',
    icon: '⌨️',
    category: 'achievement',
    description: '오른쪽 넘버패드 손가락 자리를 완전히 체득했습니다.',
    requirement: '1단계 키보드 연습 10문제 완료',
    colorClass: 'from-slate-700 to-slate-800 text-slate-200',
    borderClass: 'border-slate-600 shadow-slate-700/20',
  },
  {
    id: 'badge_grandmaster',
    name: '구구단 그랜드마스터',
    icon: '👑',
    category: 'special',
    description: '2단부터 9단까지 모든 단의 마스터 배지를 전부 수집한 전설의 5학년!',
    requirement: '2단~9단 마스터 배지 8종 모두 수집',
    colorClass: 'from-amber-400 via-amber-500 to-yellow-600 text-slate-950 font-black',
    borderClass: 'border-amber-300 shadow-amber-400/40 ring-2 ring-amber-300 animate-pulse',
  },
];

export async function awardBadgeToStudent(
  nickname: string,
  badgeId: string
): Promise<{ newlyAwarded: boolean; badge: BadgeDefinition | null }> {
  const badge = ALL_BADGES.find((b) => b.id === badgeId);
  if (!badge) return { newlyAwarded: false, badge: null };

  const userDocRef = doc(db, 'users', nickname);
  try {
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return { newlyAwarded: false, badge: null };

    const data = snap.data();
    const currentBadges: string[] = data.badges || [];

    if (currentBadges.includes(badgeId)) {
      return { newlyAwarded: false, badge: null };
    }

    const nextBadges = [...currentBadges, badgeId];

    // Check if grandmaster is unlocked (2 to 9 all unlocked)
    const allTableBadges = [2, 3, 4, 5, 6, 7, 8, 9].map((n) => `badge_table_${n}`);
    const hasAllTables = allTableBadges.every((id) => nextBadges.includes(id));
    if (hasAllTables && !nextBadges.includes('badge_grandmaster')) {
      nextBadges.push('badge_grandmaster');
    }

    await updateDoc(userDocRef, {
      badges: nextBadges,
    });

    // Update local profile
    const active = getStoredStudent();
    if (active && active.nickname === nickname) {
      setStoredStudent({
        ...active,
        badges: nextBadges,
      } as StudentProfile & { badges: string[] });
    }

    return { newlyAwarded: true, badge };
  } catch (err) {
    console.error('Failed to award badge:', err);
    return { newlyAwarded: false, badge: null };
  }
}

export function getStudentTitle(badgeCount: number): { title: string; color: string } {
  if (badgeCount >= 10) return { title: '👑 5학년 연산 대마왕', color: 'text-amber-300' };
  if (badgeCount >= 7) return { title: '⚡ 구구단 챔피언', color: 'text-indigo-300' };
  if (badgeCount >= 4) return { title: '🔥 열정의 연산가', color: 'text-rose-300' };
  if (badgeCount >= 1) return { title: '🌱 새싹 구구단 마스터', color: 'text-emerald-300' };
  return { title: '🖐️ 구구단 도전자', color: 'text-slate-400' };
}
