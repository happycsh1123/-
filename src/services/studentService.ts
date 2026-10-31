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
}

export interface GameScoreRecord {
  id?: string;
  nickname: string;
  mode: 'stage1' | 'table_easy' | 'table_hard' | 'speedrun' | 'reverse';
  modeTitle: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  avgSpeed: number;
  createdAt: string;
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
  };

  setStoredStudent(profile);
  return profile;
}

export async function recordGameScore(scoreRecord: Omit<GameScoreRecord, 'id' | 'createdAt'>): Promise<string> {
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

  // Update student stats if user document exists
  try {
    const userDocRef = doc(db, 'users', scoreRecord.nickname);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const currentSolved = data.totalSolved || 0;
      const currentBestSpeed = data.bestSpeed || 999;
      const newBestSpeed =
        scoreRecord.avgSpeed > 0
          ? Math.min(currentBestSpeed === 0 ? 999 : currentBestSpeed, scoreRecord.avgSpeed)
          : currentBestSpeed;

      await updateDoc(userDocRef, {
        totalSolved: currentSolved + scoreRecord.correctCount,
        bestSpeed: Number(newBestSpeed.toFixed(2)),
      });
    }
  } catch {
    // Non-fatal if user doc update encounters any issue
  }

  return docRef.id;
}

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
