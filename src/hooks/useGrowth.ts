import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getGrowthRecords,
  addGrowthRecord,
  updateGrowthRecord,
  deleteGrowthRecord,
  GrowthRecord,
  CreateGrowthRecord,
} from '../services/firebase/growthService';
import {
  WHO_WEIGHT_BOYS,
  WHO_WEIGHT_GIRLS,
  WHO_HEIGHT_BOYS,
  WHO_HEIGHT_GIRLS,
  WHO_HEAD_BOYS,
  WHO_HEAD_GIRLS,
  calculatePercentile,
  WHODataPoint,
} from '../constants/WhoData';
import { Gender } from '../context/BabyContext';

export interface GrowthRecordWithPercentile extends GrowthRecord {
  weightPercentile: string | null;
  heightPercentile: string | null;
  headPercentile: string | null;
  ageInMonths: number;
}

export interface ChartDataPoint {
  x: number;
  y: number;
}

export interface GrowthChartData {
  babyData: ChartDataPoint[];
  p3: ChartDataPoint[];
  p50: ChartDataPoint[];
  p97: ChartDataPoint[];
}

interface UseGrowthReturn {
  records: GrowthRecordWithPercentile[];
  isLoading: boolean;
  error: string | null;
  latestWeight: number | null;
  latestHeight: number | null;
  latestHead: number | null;
  weightChartData: GrowthChartData;
  heightChartData: GrowthChartData;
  headChartData: GrowthChartData;
  handleAddRecord: (record: CreateGrowthRecord) => Promise<void>;
  handleUpdateRecord: (id: string, record: Partial<CreateGrowthRecord>) => Promise<void>;
  handleDeleteRecord: (id: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
}

// Funciones puras fuera del hook — no se recrean en cada render
const getAgeInMonths = (recordDate: Date, birthDate: Date): number => {
  const months =
    (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (recordDate.getMonth() - birthDate.getMonth());
  return Math.max(0, Math.min(months, 24));
};

const getWeightTable = (gender: Gender | null): WHODataPoint[] =>
  gender === 'female' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS;

const getHeightTable = (gender: Gender | null): WHODataPoint[] =>
  gender === 'female' ? WHO_HEIGHT_GIRLS : WHO_HEIGHT_BOYS;

const getHeadTable = (gender: Gender | null): WHODataPoint[] =>
  gender === 'female' ? WHO_HEAD_GIRLS : WHO_HEAD_BOYS;

const enrichRecords = (
  rawRecords: GrowthRecord[],
  birthDate: Date,
  gender: Gender | null
): GrowthRecordWithPercentile[] => {
  return rawRecords.map((record) => {
    const ageInMonths = getAgeInMonths(record.date, birthDate);
    return {
      ...record,
      ageInMonths,
      weightPercentile: record.weight !== null
        ? calculatePercentile(record.weight, ageInMonths, getWeightTable(gender))
        : null,
      heightPercentile: record.height !== null
        ? calculatePercentile(record.height, ageInMonths, getHeightTable(gender))
        : null,
      headPercentile: record.headCircumference !== null
        ? calculatePercentile(record.headCircumference, ageInMonths, getHeadTable(gender))
        : null,
    };
  });
};

const buildChartData = (
  records: GrowthRecordWithPercentile[],
  getValue: (r: GrowthRecordWithPercentile) => number | null,
  table: WHODataPoint[]
): GrowthChartData => {
  const babyData: ChartDataPoint[] = records
    .filter((r) => getValue(r) !== null)
    .map((r) => ({ x: r.ageInMonths, y: getValue(r) as number }));

  return {
    babyData,
    p3: table.map((d) => ({ x: d.month, y: d.p3 })),
    p50: table.map((d) => ({ x: d.month, y: d.p50 })),
    p97: table.map((d) => ({ x: d.month, y: d.p97 })),
  };
};

export const useGrowth = (
  babyId: string | null,
  birthDate: Date | null,
  gender: Gender | null
): UseGrowthReturn => {
  const [records, setRecords] = useState<GrowthRecordWithPercentile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Usamos ref para babyId para evitar que el useEffect se dispare innecesariamente
  const babyIdRef = useRef(babyId);

  useEffect(() => {
    // Solo recargamos si el babyId realmente cambió
    if (babyIdRef.current === babyId && records.length > 0) return;
    babyIdRef.current = babyId;

    if (!userId || !babyId || !birthDate) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const raw = await getGrowthRecords(userId, babyId);
        setRecords(enrichRecords(raw, birthDate, gender));
      } catch {
        setError('No se pudieron cargar los registros.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [babyId, userId, birthDate, gender]);

  // Datos derivados
  const latestWeight = records.findLast((r) => r.weight !== null)?.weight ?? null;
  const latestHeight = records.findLast((r) => r.height !== null)?.height ?? null;
  const latestHead = records.findLast((r) => r.headCircumference !== null)?.headCircumference ?? null;

  const weightChartData = buildChartData(records, (r) => r.weight, getWeightTable(gender));
  const heightChartData = buildChartData(records, (r) => r.height, getHeightTable(gender));
  const headChartData = buildChartData(records, (r) => r.headCircumference, getHeadTable(gender));

  const refreshRecords = useCallback(async () => {
    if (!userId || !babyId || !birthDate) return;
    try {
      setIsLoading(true);
      const raw = await getGrowthRecords(userId, babyId);
      setRecords(enrichRecords(raw, birthDate, gender));
    } catch {
      setError('No se pudieron cargar los registros.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, babyId, birthDate, gender]);

  const handleAddRecord = async (record: CreateGrowthRecord): Promise<void> => {
    if (!userId || !babyId || !birthDate) return;
    try {
      const created = await addGrowthRecord(userId, babyId, record);
      const enriched = enrichRecords([created], birthDate, gender)[0];
      setRecords((prev) =>
        [...prev, enriched].sort((a, b) => a.date.getTime() - b.date.getTime())
      );
    } catch {
      setError('No se pudo guardar el registro.');
    }
  };

  const handleUpdateRecord = async (
    id: string,
    record: Partial<CreateGrowthRecord>
  ): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await updateGrowthRecord(userId, babyId, id, record);
      await refreshRecords();
    } catch {
      setError('No se pudo actualizar el registro.');
    }
  };

  const handleDeleteRecord = async (id: string): Promise<void> => {
    if (!userId || !babyId) return;
    try {
      await deleteGrowthRecord(userId, babyId, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('No se pudo eliminar el registro.');
    }
  };

  return {
    records,
    isLoading,
    error,
    latestWeight,
    latestHeight,
    latestHead,
    weightChartData,
    heightChartData,
    headChartData,
    handleAddRecord,
    handleUpdateRecord,
    handleDeleteRecord,
    refreshRecords,
  };
};