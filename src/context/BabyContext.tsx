import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getAuth } from 'firebase/auth';
import {
  Baby,
  Gender,
  getBabies,
  getActiveBabyId,
  saveActiveBabyId,
  createBaby,
  removeBaby,
} from '../services/firebase/babyService';

export type { Baby, Gender };


interface BabyContextValue {
  babies: Baby[];
  activeBaby: Baby | null;
  isLoading: boolean;
  error: string | null;
  setActiveBaby: (baby: Baby) => Promise<void>;
  addBaby: (name: string, birthDate: Date, gender: Gender) => Promise<void>;
  deleteBaby: (babyId: string) => Promise<void>;
  getAgeInMonths: (baby: Baby) => number;
}

const BabyContext = createContext<BabyContextValue | undefined>(undefined);


interface BabyProviderProps {
  children: ReactNode;
}

export function BabyProvider({ children }: BabyProviderProps) {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [activeBaby, setActiveBabyState] = useState<Baby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    loadBabies();
  }, [userId]);

  const loadBabies = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      setError(null);

      const loadedBabies = await getBabies(userId);
      setBabies(loadedBabies);

      const activeBabyId = await getActiveBabyId(userId);

      if (activeBabyId) {
        const active = loadedBabies.find((b) => b.id === activeBabyId);
        if (active) setActiveBabyState(active);
      } else if (loadedBabies.length > 0) {
        setActiveBabyState(loadedBabies[0]);
      }
    } catch {
      setError('No se pudieron cargar los bebés.');
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveBaby = async (baby: Baby): Promise<void> => {
    if (!userId) return;
    try {
      setActiveBabyState(baby);
      await saveActiveBabyId(userId, baby.id);
    } catch {
      setError('No se pudo cambiar el bebé activo.');
    }
  };

  const addBaby = async (
    name: string,
    birthDate: Date,
    gender: Gender
  ): Promise<void> => {
    if (!userId) return;
    try {
      const newBaby = await createBaby(userId, name, birthDate, gender);
      setBabies((prev) => [...prev, newBaby]);

      if (babies.length === 0) {
        await setActiveBaby(newBaby);
      }
    } catch {
      setError('No se pudo agregar el bebé.');
    }
  };

  const deleteBaby = async (babyId: string): Promise<void> => {
    if (!userId) return;
    try {
      await removeBaby(userId, babyId);
      const updated = babies.filter((b) => b.id !== babyId);
      setBabies(updated);

      if (activeBaby?.id === babyId) {
        const next = updated[0] ?? null;
        setActiveBabyState(next);
        if (next) await saveActiveBabyId(userId, next.id);
      }
    } catch {
      setError('No se pudo eliminar el bebé.');
    }
  };

  const getAgeInMonths = (baby: Baby): number => {
    const now = new Date();
    const birth = baby.birthDate;
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());
    return Math.max(0, months);
  };

  return (
    <BabyContext.Provider
      value={{
        babies,
        activeBaby,
        isLoading,
        error,
        setActiveBaby,
        addBaby,
        deleteBaby,
        getAgeInMonths,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

// --- Hook personalizado ---
export const useBabyContext = (): BabyContextValue => {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error('useBabyContext debe usarse dentro de BabyProvider');
  }
  return context;
};