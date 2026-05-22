import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './config';

export interface GrowthRecord {
  id: string;
  date: Date;
  weight: number | null;        // kg con decimales
  height: number | null;        // cm
  headCircumference: number | null; // cm
  notes: string;
  createdAt: Date;
}

export interface CreateGrowthRecord {
  date: Date;
  weight: number | null;
  height: number | null;
  headCircumference: number | null;
  notes: string;
}

const growthRef = (userId: string, babyId: string) =>
  collection(db, 'users', userId, 'babies', babyId, 'growth');

const growthDocRef = (userId: string, babyId: string, recordId: string) =>
  doc(db, 'users', userId, 'babies', babyId, 'growth', recordId);


export const getGrowthRecords = async (
  userId: string,
  babyId: string
): Promise<GrowthRecord[]> => {
  const q = query(growthRef(userId, babyId), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      date: (data.date as Timestamp).toDate(),
      weight: data.weight ?? null,
      height: data.height ?? null,
      headCircumference: data.headCircumference ?? null,
      notes: data.notes ?? '',
      createdAt: (data.createdAt as Timestamp).toDate(),
    };
  });
};


export const addGrowthRecord = async (
  userId: string,
  babyId: string,
  record: CreateGrowthRecord
): Promise<GrowthRecord> => {
  const docRef = await addDoc(growthRef(userId, babyId), {
    date: Timestamp.fromDate(record.date),
    weight: record.weight,
    height: record.height,
    headCircumference: record.headCircumference,
    notes: record.notes,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    date: record.date,
    weight: record.weight,
    height: record.height,
    headCircumference: record.headCircumference,
    notes: record.notes,
    createdAt: new Date(),
  };
};


export const updateGrowthRecord = async (
  userId: string,
  babyId: string,
  recordId: string,
  record: Partial<CreateGrowthRecord>
): Promise<void> => {
  const updateData: Record<string, any> = {};

  if (record.date) updateData.date = Timestamp.fromDate(record.date);
  if (record.weight !== undefined) updateData.weight = record.weight;
  if (record.height !== undefined) updateData.height = record.height;
  if (record.headCircumference !== undefined) updateData.headCircumference = record.headCircumference;
  if (record.notes !== undefined) updateData.notes = record.notes;

  await updateDoc(growthDocRef(userId, babyId, recordId), updateData);
};

export const deleteGrowthRecord = async (
  userId: string,
  babyId: string,
  recordId: string
): Promise<void> => {
  await deleteDoc(growthDocRef(userId, babyId, recordId));
};