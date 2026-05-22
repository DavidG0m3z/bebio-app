import { useState, useEffect, useCallback } from 'react';
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
} from '../constants/WhoData';
import { Gender } from '../context/BabyContext';

export interface GrowthRecordWithPercentile extends GrowthRecord {
  weightPercentile: string | null;
  heightPercentile: string | null;
  headPercentile: string | null;
  ageInMonths: number;
}

export interface ChartDataPoint {
  x: number; // edad en meses
  y: number; // valor medido
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

  const getAgeInMonths = useCallback((recordDate: Date): number => {
    if (!birthDate) return 0;
    const months =
      (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
      (recordDate.getMonth() - birthDate.getMonth());
    return Math.max(0, Math.min(months, 24));
  }, [birthDate]);

  const getWeightTable = useCallback(() => {
    return gender === 'female' ? WHO_WEIGHT_GIRLS : WHO_WEIGHT_BOYS;
  }, [gender]);

  const getHeightTable = useCallback(() => {
    return gender === 'female' ? WHO_HEIGHT_GIRLS : WHO_HEIGHT_BOYS;
  }, [gender]);

  const getHeadTable = useCallback(() => {
    return gender === 'female' ? WHO_HEAD_GIRLS : WHO_HEAD_BOYS;
  }, [gender]);

  const enrichRecords = useCallback((
    rawRecords: GrowthRecord[]
  ): GrowthRecordWithPercentile[] => {
    console.log('🍼 birthDate:', birthDate);
    console.log('👤 gender:', gender);

    return rawRecords.map((record) => {
      const ageInMonths = getAgeInMonths(record.date);
      console.log('📅 record.date:', record.date, '→ ageInMonths:', ageInMonths);

      return {
        ...record,
        ageInMonths,
        weightPercentile: record.weight !== null
          ? calculatePercentile(record.weight, ageInMonths, getWeightTable())
          : null,
        heightPercentile: record.height !== null
          ? calculatePercentile(record.height, ageInMonths, getHeightTable())
          : null,
        headPercentile: record.headCircumference !== null
          ? calculatePercentile(record.headCircumference, ageInMonths, getHeadTable())
          : null,
      };
    });
  }, [getAgeInMonths, getWeightTable, getHeightTable, getHeadTable]);

  const loadRecords = useCallback(async () => {
    if (!userId || !babyId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const raw = await getGrowthRecords(userId, babyId);

      setRecords(enrichRecords(raw));
    } catch {
      setError('No se pudieron cargar los registros.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, babyId, enrichRecords]);

  useEffect(() => {
    setRecords([]);
    loadRecords();
  }, [loadRecords]);


  const latestWeight = records.findLast((r) => r.weight !== null)?.weight ?? null;
  const latestHeight = records.findLast((r) => r.height !== null)?.height ?? null;
  const latestHead = records.findLast((r) => r.headCircumference !== null)?.headCircumference ?? null;

  const buildChartData = useCallback((
    getValue: (r: GrowthRecordWithPercentile) => number | null,
    table: ReturnType<typeof getWeightTable>
  ): GrowthChartData => {
    const babyData: ChartDataPoint[] = records
      .filter((r) => getValue(r) !== null)
      .map((r) => ({ x: r.ageInMonths, y: getValue(r) as number }));

    const p3: ChartDataPoint[] = table.map((d) => ({ x: d.month, y: d.p3 }));
    const p50: ChartDataPoint[] = table.map((d) => ({ x: d.month, y: d.p50 }));
    const p97: ChartDataPoint[] = table.map((d) => ({ x: d.month, y: d.p97 }));

    return { babyData, p3, p50, p97 };
  }, [records]);

  const weightChartData = buildChartData((r) => r.weight, getWeightTable());
  const heightChartData = buildChartData((r) => r.height, getHeightTable());
  const headChartData = buildChartData((r) => r.headCircumference, getHeadTable());


  const handleAddRecord = async (record: CreateGrowthRecord): Promise<void> => {
    if (!userId || !babyId) return;


    try {


      const created = await addGrowthRecord(userId, babyId, record);
      console.log('✅ Registro guardado:', created);

      const enriched = enrichRecords([created])[0];
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
      await loadRecords();
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
    refreshRecords: loadRecords,
  };
};