import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface StudentProfile {
  nickname: string;
  createdAt: string;
  lastLoginAt?: string;
  totalSolved?: number;
  bestSpeed?: number;
  initialSpeed?: number;
  speedImprovement?: number; // In seconds (e.g. 0.4s faster than initial)
  streakDays?: number;
  badges?: string[];
}

export interface GameScoreRecord {
  id?: string;
  nickname: string;
  mode: 'stage1' | 'table_easy' | 'table_hard' | 'speedrun' | 'reverse' | 'table_single';
  modeTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  avgSpeed: number;
  createdAt: string;
}

export interface ClassStats {
  totalProblemsSolved: number;
  targetGoal: number;
  milestoneTitle: string;
  averageScore: number;       // 우리 반 2분 실전 스피드런 평균 점수 (0~100)
  targetScore: number;        // 주간 목표 점수: 80점부터 시작, 매주 +5점씩 상향 (80 ➔ 85 ➔ 90 ➔ 95 ➔ 100)
  currentWeek: number;        // 현재 챌린지 주차 (1주차, 2주차...)
  totalParticipants: number;  // 2분 스피드런 참여 횟수
  totalScoreSum: number;      // 2분 스피드런 점수 합계
  startDate: string;          // 챌린지 시작 일시
  lastUpdated?: string;
}

export function computeWeeklyTarget(startDateStr?: string): { currentWeek: number; targetScore: number } {
  const start = startDateStr ? new Date(startDateStr).getTime() : Date.now();
  const diffDays = Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)));
  const currentWeek = Math.floor(diffDays / 7) + 1;
  // Start at 80 points, increase by 5 points every week, up to 100 max
  const targetScore = Math.min(100, 80 + (currentWeek - 1) * 5);
  return { currentWeek, targetScore };
}

export interface RecordScoreResult {
  scoreId: string;
  isNewPersonalBest: boolean;
  improvedSeconds: number; // > 0 if faster than previous best
  studentTotalSolved: number;
  classTotalSolved: number;
}

// Password hashing using browser Web Crypto SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_gugudan_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY = 'gugudan_active_student';

export function getStoredStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredStudent(student: StudentProfile | null) {
  if (student) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function registerStudent(nicknameInput: string, passwordInput: string): Promise<StudentProfile> {
  const nickname = nicknameInput.trim();
  const password = passwordInput.trim();

  if (nickname.length < 2 || nickname.length > 15) {
    throw new Error('닉네임은 2자 이상 15자 이하로 입력해주세요.');
  }
  if (nickname.includes('/') || nickname.includes('.') || nickname.includes('#')) {
    throw new Error('닉네임에 특수기호(/, ., #)는 포함할 수 없습니다.');
  }
  if (password.length < 4) {
    throw new Error('비밀번호는 4자리 이상으로 설정해주세요.');
  }

  const userDocRef = doc(db, 'users', nickname);

  let existingSnap;
  try {
    existingSnap = await getDoc(userDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${nickname}`);
  }

  if (existingSnap.exists()) {
    throw new Error('이미 등록된 닉네임입니다. 다른 닉네임을 선택하거나 로그인해주세요.');
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const newUserData = {
    nickname,
    passwordHash,
    createdAt: now,
    lastLoginAt: now,
    totalSolved: 0,
    bestSpeed: 0,
    initialSpeed: 0,
    speedImprovement: 0,
    streakDays: 1,
    badges: [],
  };

  try {
    await setDoc(userDocRef, newUserData);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `users/${nickname}`);
  }

  const profile: StudentProfile = {
    nickname,
    createdAt: now,
    lastLoginAt: now,
    totalSolved: 0,
    bestSpeed: 0,
    initialSpeed: 0,
    speedImprovement: 0,
    streakDays: 1,
    badges: [],
  };

  setStoredStudent(profile);
  return profile;
}

export async function loginStudent(nicknameInput: string, passwordInput: string): Promise<StudentProfile> {
  const nickname = nicknameInput.trim();
  const password = passwordInput.trim();

  if (!nickname) throw new Error('닉네임을 입력해주세요.');
  if (!password) throw new Error('비밀번호를 입력해주세요.');

  const userDocRef = doc(db, 'users', nickname);

  let userSnap;
  try {
    userSnap = await getDoc(userDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${nickname}`);
  }

  if (!userSnap.exists()) {
    throw new Error('등록되지 않은 닉네임입니다. 먼저 회원가입을 진행해주세요.');
  }

  const data = userSnap.data();
  const passwordHash = await hashPassword(password);

  if (data.passwordHash !== passwordHash) {
    throw new Error('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
  }

  const now = new Date().toISOString();
  try {
    await updateDoc(userDocRef, {
      lastLoginAt: now,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${nickname}`);
  }

  const profile: StudentProfile = {
    nickname: data.nickname,
    createdAt: data.createdAt,
    lastLoginAt: now,
    totalSolved: data.totalSolved || 0,
    bestSpeed: data.bestSpeed || 0,
    initialSpeed: data.initialSpeed || 0,
    speedImprovement: data.speedImprovement || 0,
    streakDays: data.streakDays || 1,
    badges: data.badges || [],
  };

  setStoredStudent(profile);
  return profile;
}

export async function updateStudentStreak(nickname: string, streak: number) {
  try {
    const userDocRef = doc(db, 'users', nickname);
    await updateDoc(userDocRef, {
      streakDays: streak,
    });
  } catch {
    // Non-fatal
  }
}

// Compute milestone goal based on current count
export function getMilestoneInfo(totalSolved: number): { targetGoal: number; title: string } {
  if (totalSolved < 500) return { targetGoal: 500, title: '🌱 1차 목표: 구구단 씨앗 심기 (500문제)' };
  if (totalSolved < 1000) return { targetGoal: 1000, title: '🌿 2차 목표: 구구단 싹 틔우기 (1,000문제)' };
  if (totalSolved < 2500) return { targetGoal: 2500, title: '🌳 3차 목표: 5학년 연산 숲 완성 (2,500문제)' };
  if (totalSolved < 5000) return { targetGoal: 5000, title: '👑 4차 목표: 전원 1.5초 마스터 왕국 (5,000문제)' };
  return { targetGoal: 10000, title: '🚀 전설의 구구단 명예의 전당 (10,000문제)' };
}

export async function recordGameScore(scoreRecord: Omit<GameScoreRecord, 'id' | 'createdAt'>): Promise<RecordScoreResult> {
  const recordWithTime = {
    ...scoreRecord,
    createdAt: new Date().toISOString(),
  };

  let docRef;
  try {
    docRef = await addDoc(collection(db, 'game_scores'), recordWithTime);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'game_scores');
  }

  let isNewPersonalBest = false;
  let improvedSeconds = 0;
  let studentTotalSolved = scoreRecord.correctCount;

  // 1. Update student personal progress & growth metrics
  try {
    const userDocRef = doc(db, 'users', scoreRecord.nickname);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const prevSolved = data.totalSolved || 0;
      studentTotalSolved = prevSolved + scoreRecord.correctCount;

      const prevBestSpeed = data.bestSpeed || 0;
      const initialSpeed = data.initialSpeed || scoreRecord.avgSpeed;

      let newBestSpeed = prevBestSpeed;
      if (scoreRecord.avgSpeed > 0) {
        if (prevBestSpeed === 0) {
          newBestSpeed = scoreRecord.avgSpeed;
        } else if (scoreRecord.avgSpeed < prevBestSpeed) {
          isNewPersonalBest = true;
          improvedSeconds = Number((prevBestSpeed - scoreRecord.avgSpeed).toFixed(2));
          newBestSpeed = scoreRecord.avgSpeed;
        }
      }

      const totalImprovement = initialSpeed > 0 && newBestSpeed > 0
        ? Number(Math.max(0, initialSpeed - newBestSpeed).toFixed(2))
        : 0;

      await updateDoc(userDocRef, {
        totalSolved: studentTotalSolved,
        bestSpeed: Number(newBestSpeed.toFixed(2)),
        initialSpeed: Number(initialSpeed.toFixed(2)),
        speedImprovement: totalImprovement,
      });

      // Update local storage profile as well
      const active = getStoredStudent();
      if (active && active.nickname === scoreRecord.nickname) {
        setStoredStudent({
          ...active,
          totalSolved: studentTotalSolved,
          bestSpeed: Number(newBestSpeed.toFixed(2)),
          initialSpeed: Number(initialSpeed.toFixed(2)),
          speedImprovement: totalImprovement,
        });
      }
    }
  } catch (err) {
    console.warn('Failed to update student user doc:', err);
  }

  // 2. Update classroom collective progress (ClassStats)
  let classTotalSolved = 0;
  try {
    const statsDocRef = doc(db, 'class_stats', 'overall');
    const statsSnap = await getDoc(statsDocRef);
    const nowIso = new Date().toISOString();

    if (statsSnap.exists()) {
      const cur = statsSnap.data();
      const prevProblems = cur.totalProblemsSolved || 0;
      classTotalSolved = prevProblems + scoreRecord.correctCount;

      const startDate = cur.startDate || nowIso;
      const { currentWeek, targetScore } = computeWeeklyTarget(startDate);

      let totalScoreSum = cur.totalScoreSum || 0;
      let totalParticipants = cur.totalParticipants || 0;
      let averageScore = cur.averageScore || 80;

      if (scoreRecord.mode === 'speedrun') {
        const speedrun100 = Math.min(
          100,
          Math.round(Math.min(70, scoreRecord.correctCount * 2.5) + scoreRecord.accuracy * 0.3)
        );
        totalScoreSum += speedrun100;
        totalParticipants += 1;
        averageScore = Number((totalScoreSum / totalParticipants).toFixed(1));
      }

      await updateDoc(statsDocRef, {
        totalProblemsSolved: classTotalSolved,
        averageScore,
        targetScore,
        currentWeek,
        totalScoreSum,
        totalParticipants,
        startDate,
        lastUpdated: nowIso,
      });
    } else {
      classTotalSolved = scoreRecord.correctCount;
      const startDate = nowIso;
      const { currentWeek, targetScore } = computeWeeklyTarget(startDate);

      let totalScoreSum = 0;
      let totalParticipants = 0;
      let averageScore = 80;

      if (scoreRecord.mode === 'speedrun') {
        const speedrun100 = Math.min(
          100,
          Math.round(Math.min(70, scoreRecord.correctCount * 2.5) + scoreRecord.accuracy * 0.3)
        );
        totalScoreSum = speedrun100;
        totalParticipants = 1;
        averageScore = speedrun100;
      }

      await setDoc(statsDocRef, {
        totalProblemsSolved: classTotalSolved,
        targetGoal: 1000,
        averageScore,
        targetScore,
        currentWeek,
        totalScoreSum,
        totalParticipants,
        startDate,
        lastUpdated: nowIso,
      });
    }
  } catch (err) {
    console.warn('Failed to update class_stats:', err);
  }

  return {
    scoreId: docRef.id,
    isNewPersonalBest,
    improvedSeconds,
    studentTotalSolved,
    classTotalSolved,
  };
}

// Subscribe to all users for Effort/Growth/Streak Leaderboards
export function subscribeUsers(onUsers: (users: StudentProfile[]) => void) {
  const usersQuery = query(collection(db, 'users'), limit(100));

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      const list: StudentProfile[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          nickname: d.nickname,
          createdAt: d.createdAt,
          lastLoginAt: d.lastLoginAt,
          totalSolved: d.totalSolved || 0,
          bestSpeed: d.bestSpeed || 0,
          initialSpeed: d.initialSpeed || 0,
          speedImprovement: d.speedImprovement || 0,
          streakDays: d.streakDays || 1,
          badges: d.badges || [],
        });
      });
      onUsers(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

// Subscribe to Classroom Collaborative Stats
export function subscribeClassStats(onStats: (stats: ClassStats) => void) {
  const statsDocRef = doc(db, 'class_stats', 'overall');

  return onSnapshot(
    statsDocRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const total = d.totalProblemsSolved || 0;
        const milestone = getMilestoneInfo(total);
        const startDate = d.startDate || new Date().toISOString();
        const { currentWeek, targetScore } = computeWeeklyTarget(startDate);

        onStats({
          totalProblemsSolved: total,
          targetGoal: milestone.targetGoal,
          milestoneTitle: milestone.title,
          averageScore: d.averageScore != null ? d.averageScore : 80.0,
          targetScore: d.targetScore != null ? d.targetScore : targetScore,
          currentWeek: d.currentWeek || currentWeek,
          totalParticipants: d.totalParticipants || 0,
          totalScoreSum: d.totalScoreSum || 0,
          startDate,
          lastUpdated: d.lastUpdated,
        });
      } else {
        const milestone = getMilestoneInfo(0);
        const { currentWeek, targetScore } = computeWeeklyTarget();
        onStats({
          totalProblemsSolved: 0,
          targetGoal: milestone.targetGoal,
          milestoneTitle: milestone.title,
          averageScore: 80.0,
          targetScore,
          currentWeek,
          totalParticipants: 0,
          totalScoreSum: 0,
          startDate: new Date().toISOString(),
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'class_stats/overall');
    }
  );
}

// Subscribe to individual Game Scores
export function subscribeScores(
  onScores: (scores: GameScoreRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const scoresQuery = query(
    collection(db, 'game_scores'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    scoresQuery,
    (snapshot) => {
      const results: GameScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        results.push({
          id: docSnap.id,
          nickname: d.nickname,
          mode: d.mode,
          modeTitle: d.modeTitle,
          score: d.score,
          correctCount: d.correctCount,
          wrongCount: d.wrongCount || 0,
          accuracy: d.accuracy,
          avgSpeed: d.avgSpeed,
          createdAt: d.createdAt,
        });
      });
      onScores(results);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'game_scores');
    }
  );
}
