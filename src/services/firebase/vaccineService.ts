import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { VACCINE_LIST } from '../../constants/vaccineList';


export type VaccineStatus = 'applied' | 'pending';

export interface Vaccine {
  id: string;
  name: string;
  ageLabel: string;
  ageMonths: number;
  description: string;
  status: VaccineStatus;
  appliedDate: Date | null;
  scheduledDate: Date | null;
  isCustom: boolean;
}

const vaccinesRef = (userId: string) =>
  collection(db, 'users', userId, 'vaccines');

const vaccineDocRef = (userId: string, vaccineId: string) =>
  doc(db, 'users', userId, 'vaccines', vaccineId);

export const initializeUserVaccines = async (userId: string): Promise<void> => {
  await Promise.all(
    VACCINE_LIST.map((vaccine) =>
      setDoc(vaccineDocRef(userId, vaccine.id), {
        name: vaccine.name,
        ageLabel: vaccine.ageLabel,
        ageMonths: vaccine.ageMonths,
        description: vaccine.description,
        status: 'pending',
        appliedDate: null,
        scheduledDate: null,
        isCustom: false,
      })
    )
  );
};

export const getUserVaccines = async (userId: string): Promise<Vaccine[]> => {
  const snapshot = await getDocs(vaccinesRef(userId));

  const vaccines = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      ageLabel: data.ageLabel,
      ageMonths: data.ageMonths,
      description: data.description,
      status: data.status as VaccineStatus,
      appliedDate: data.appliedDate
        ? (data.appliedDate as Timestamp).toDate()
        : null,
      scheduledDate: data.scheduledDate
        ? (data.scheduledDate as Timestamp).toDate()
        : null,
      isCustom: data.isCustom,
    } as Vaccine;
  });

  return vaccines.sort((a, b) => a.ageMonths - b.ageMonths);
};

export const scheduleVaccine = async (
  userId: string,
  vaccineId: string,
  scheduledDate: Date
): Promise<void> => {
  await updateDoc(vaccineDocRef(userId, vaccineId), {
    scheduledDate: Timestamp.fromDate(scheduledDate),
  });
};

export const markVaccineAsApplied = async (
  userId: string,
  vaccineId: string,
  appliedDate: Date
): Promise<void> => {
  await updateDoc(vaccineDocRef(userId, vaccineId), {
    status: 'applied',
    appliedDate: Timestamp.fromDate(appliedDate),
  });
};


export const markVaccineAsPending = async (
  userId: string,
  vaccineId: string
): Promise<void> => {
  await updateDoc(vaccineDocRef(userId, vaccineId), {
    status: 'pending',
    appliedDate: null,
  });
};

export const addCustomVaccine = async (
  userId: string,
  name: string,
  ageLabel: string,
  scheduledDate: Date | null,
): Promise<void> => {
  const customId = `custom_${Date.now()}`;
  await setDoc(vaccineDocRef(userId, customId), {
    name,
    ageLabel,
    ageMonths: 999,
    description: 'Vacuna personalizada',
    status: 'pending',
    appliedDate: null,
    scheduledDate: scheduledDate
      ? Timestamp.fromDate(scheduledDate)
      : null,
    isCustom: true,
  });
};

export const deleteCustomVaccine = async (
  userId: string,
  vaccineId: string
): Promise<void> => {
  await deleteDoc(vaccineDocRef(userId, vaccineId));
};