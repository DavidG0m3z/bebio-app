import { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getUserVaccines,
  markVaccineAsApplied,
  markVaccineAsPending,
  addCustomVaccine,
  deleteCustomVaccine,
  initializeUserVaccines,
  scheduleVaccine,
  Vaccine,
} from '../services/firebase/vaccineService';

interface VaccinesState {
  vaccines: Vaccine[];
  isLoading: boolean;
  error: string | null;
}

interface UseVaccinesReturn extends VaccinesState {
  appliedVaccines: Vaccine[];
  pendingVaccines: Vaccine[];
  nextVaccine: Vaccine | null;
  vaccinesByAge: Record<string, Vaccine[]>;
  progress: { applied: number; total: number; percentage: number };
  handleMarkAsApplied: (vaccineId: string, date: Date) => Promise<void>;
  handleMarkAsPending: (vaccineId: string) => Promise<void>;
  handleAddCustomVaccine: (name: string, ageLabel: string, scheduledDate: Date | null) => Promise<void>;
  handleDeleteCustomVaccine: (vaccineId: string) => Promise<void>;
  handleScheduleVaccine: (vaccineId: string, date: Date) => Promise<void>;
  refreshVaccines: () => Promise<void>;
}

export const useVaccines = (babyId: string | null): UseVaccinesReturn => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const loadVaccines = useCallback(async () => {

    if (!userId || !babyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getUserVaccines(userId, babyId);

      if (data.length === 0) {

        await initializeUserVaccines(userId, babyId);
        const initialized = await getUserVaccines(userId, babyId);

        setVaccines(initialized);
      } else {
        setVaccines(data);
      }
    } catch {

      setError('No se pudieron cargar las vacunas.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, babyId]);

  useEffect(() => {
    setVaccines([]);
    loadVaccines();
  }, [loadVaccines]);

  const appliedVaccines = vaccines.filter((v) => v.status === 'applied');
  const pendingVaccines = vaccines.filter((v) => v.status === 'pending');
  const nextVaccine = pendingVaccines.length > 0 ? pendingVaccines[0] : null;

  const vaccinesByAge = pendingVaccines.reduce((groups, vaccine) => {
    const key = vaccine.ageLabel;
    if (!groups[key]) groups[key] = [];
    groups[key].push(vaccine);
    return groups;
  }, {} as Record<string, Vaccine[]>);

  const progress = {
    applied: appliedVaccines.length,
    total: vaccines.length,
    percentage:
      vaccines.length > 0
        ? Math.round((appliedVaccines.length / vaccines.length) * 100)
        : 0,
  };


  const handleMarkAsApplied = async (
    vaccineId: string,
    date: Date
  ): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await markVaccineAsApplied(userId, babyId, vaccineId, date);
      setVaccines((prev) =>
        prev.map((v) =>
          v.id === vaccineId
            ? { ...v, status: 'applied', appliedDate: date }
            : v
        )
      );
    } catch {
      setError('No se pudo marcar la vacuna como aplicada.');
    }
  };

  const handleMarkAsPending = async (vaccineId: string): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await markVaccineAsPending(userId, babyId, vaccineId);
      setVaccines((prev) =>
        prev.map((v) =>
          v.id === vaccineId
            ? { ...v, status: 'pending', appliedDate: null }
            : v
        )
      );
    } catch {
      setError('No se pudo actualizar la vacuna.');
    }
  };

  const handleAddCustomVaccine = async (
    name: string,
    ageLabel: string,
    scheduledDate: Date | null,
  ): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await addCustomVaccine(userId, babyId, name, ageLabel, scheduledDate);
      await loadVaccines();
    } catch {
      setError('No se pudo agregar la vacuna.');
    }
  };

  const handleDeleteCustomVaccine = async (
    vaccineId: string
  ): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await deleteCustomVaccine(userId, babyId, vaccineId);
      setVaccines((prev) => prev.filter((v) => v.id !== vaccineId));
    } catch {
      setError('No se pudo eliminar la vacuna.');
    }
  };

  const handleScheduleVaccine = async (
    vaccineId: string,
    date: Date
  ): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await scheduleVaccine(userId, babyId, vaccineId, date);
      setVaccines((prev) =>
        prev.map((v) =>
          v.id === vaccineId ? { ...v, scheduledDate: date } : v
        )
      );
    } catch {
      setError('No se pudo programar la vacuna.');
    }
  };

  return {
    vaccines,
    isLoading,
    error,
    appliedVaccines,
    pendingVaccines,
    nextVaccine,
    vaccinesByAge,
    progress,
    handleMarkAsApplied,
    handleMarkAsPending,
    handleAddCustomVaccine,
    handleDeleteCustomVaccine,
    handleScheduleVaccine,
    refreshVaccines: loadVaccines,
  };
};