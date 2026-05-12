import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

export type Gender = 'male' | 'female';

export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: Gender;
}

const babiesRef = (userId: string) =>
  collection(db, 'users', userId, 'babies');

const babyDocRef = (userId: string, babyId: string) =>
  doc(db, 'users', userId, 'babies', babyId);

const userDocRef = (userId: string) =>
  doc(db, 'users', userId);


export const getBabies = async (userId: string): Promise<Baby[]> => {
  const snapshot = await getDocs(babiesRef(userId));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      birthDate: (data.birthDate as Timestamp).toDate(),
      gender: data.gender as Gender,
    };
  });
};

export const getActiveBabyId = async (
  userId: string
): Promise<string | null> => {
  const userDoc = await getDoc(userDocRef(userId));
  return userDoc.data()?.activeBabyId ?? null;
};

export const saveActiveBabyId = async (
  userId: string,
  babyId: string
): Promise<void> => {
  await updateDoc(userDocRef(userId), { activeBabyId: babyId });
};

export const createBaby = async (
  userId: string,
  name: string,
  birthDate: Date,
  gender: Gender
): Promise<Baby> => {
  const docRef = await addDoc(babiesRef(userId), {
    name,
    birthDate: Timestamp.fromDate(birthDate),
    gender,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id, name, birthDate, gender };
};

export const removeBaby = async (
  userId: string,
  babyId: string
): Promise<void> => {
  await deleteDoc(babyDocRef(userId, babyId));
};