import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLegend } from 'victory-native';
import { useBabyContext } from '../../context/BabyContext';
import { useGrowth } from '../../hooks/useGrowth';
import { CreateGrowthRecord } from '../../services/firebase/growthService';
import { colors } from '../../constants/theme';
import { getPercentileColor } from '../../constants/WhoData';
import DatePickerModal from '../../components/common/DatePickerModal';

type ChartTab = 'weight' | 'height' | 'head';

export default function GrowthScreen() {
  const { activeBaby } = useBabyContext();

  const {
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
    handleDeleteRecord,
  } = useGrowth(
    activeBaby?.id ?? null,
    activeBaby?.birthDate ?? null,
    activeBaby?.gender ?? null
  );

  // Tab activo de la gráfica
  const [activeTab, setActiveTab] = useState<ChartTab>('weight');

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [headInput, setHeadInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const resetModal = () => {
    setRecordDate(new Date());
    setWeightInput('');
    setHeightInput('');
    setHeadInput('');
    setNotesInput('');
    setShowModal(false);
  };

  const onSaveRecord = async () => {
    // Al menos peso o talla deben tener valor
    if (!weightInput.trim() && !heightInput.trim()) {
      Alert.alert('Error', 'Ingresa al menos el peso o la talla.');
      return;
    }

    const record: CreateGrowthRecord = {
      date: recordDate,
      weight: weightInput ? parseFloat(weightInput) : null,
      height: heightInput ? parseFloat(heightInput) : null,
      headCircumference: headInput ? parseFloat(headInput) : null,
      notes: notesInput.trim(),
    };

    try {
      setIsSaving(true);
      await handleAddRecord(record);
      resetModal();
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteRecord = (id: string) => {
    Alert.alert(
      'Eliminar registro',
      '¿Deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleDeleteRecord(id),
        },
      ]
    );
  };

  // Selecciona los datos de la gráfica según el tab activo
  const getActiveChartData = () => {
    if (activeTab === 'weight') return weightChartData;
    if (activeTab === 'height') return heightChartData;
    return headChartData;
  };

  const getActiveUnit = () => {
    if (activeTab === 'weight') return 'kg';
    return 'cm';
  };

  const getActiveLabel = () => {
    if (activeTab === 'weight') return 'Peso';
    if (activeTab === 'height') return 'Talla';
    return 'Perímetro cefálico';
  };

  // Estado vacío — sin bebé activo
  if (!activeBaby) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral px-8">
        <Text className="text-4xl mb-4">📏</Text>
        <Text className="text-text-primary text-lg font-bold text-center mb-2">
          No hay bebé activo
        </Text>
        <Text className="text-text-secondary text-sm text-center">
          Ve a tu Perfil y registra un bebé para ver su crecimiento.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-text-secondary mt-3">Cargando registros...</Text>
      </View>
    );
  }

  const chartData = getActiveChartData();

  return (
    <SafeAreaView className="flex-1 bg-neutral">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── HEADER ── */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-text-primary text-2xl font-bold">
            Crecimiento
          </Text>
          <Text className="text-text-secondary text-sm">
            Evolución de {activeBaby.name}
          </Text>
        </View>

        {/* ── TARJETAS ÚLTIMAS MÉTRICAS ── */}
        <View className="flex-row mx-5 mb-5 gap-3">
          <MetricCard
            label="Último peso"
            value={latestWeight !== null ? `${latestWeight} kg` : '—'}
            icon="barbell-outline"
          />
          <MetricCard
            label="Última talla"
            value={latestHeight !== null ? `${latestHeight} cm` : '—'}
            icon="resize-outline"
          />
          <MetricCard
            label="Perímetro"
            value={latestHead !== null ? `${latestHead} cm` : '—'}
            icon="ellipse-outline"
          />
        </View>

        {/* ── TABS DE GRÁFICA ── */}
        <View className="mx-5 mb-4 flex-row bg-white rounded-xl p-1 border border-border">
          {(['weight', 'height', 'head'] as ChartTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-primary' : ''
                }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-xs font-semibold ${activeTab === tab ? 'text-white' : 'text-text-secondary'
                  }`}
              >
                {tab === 'weight' ? 'Peso' : tab === 'height' ? 'Talla' : 'Cabeza'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── GRÁFICA ── */}
        <View className="mx-5 mb-5 bg-white rounded-2xl p-4">
          <Text className="text-text-primary font-bold text-base mb-1">
            Curva de {getActiveLabel()}
          </Text>
          <Text className="text-text-secondary text-xs mb-3">
            Progreso desde el nacimiento vs OMS
          </Text>

          {chartData.babyData.length === 0 ? (
            // Estado vacío de la gráfica
            <View className="h-48 items-center justify-center">
              <Text className="text-text-disabled text-sm text-center">
                Agrega registros para ver la gráfica
              </Text>
            </View>
          ) : (
            <VictoryChart
              height={220}
              width={320}
              padding={{ top: 10, bottom: 40, left: 45, right: 20 }}
              domain={{ x: [0, 24] }}
            >
              {/* Eje X — meses */}
              <VictoryAxis
                tickValues={[0, 3, 6, 9, 12, 15, 18, 21, 24]}
                tickFormat={(t: number) => `${t}m`}
                style={{
                  tickLabels: { fontSize: 9, fill: colors.textSecondary },
                  grid: { stroke: colors.border, strokeWidth: 0.5 },
                }}
              />

              {/* Eje Y — valores */}
              <VictoryAxis
                dependentAxis
                style={{
                  tickLabels: { fontSize: 9, fill: colors.textSecondary },
                  grid: { stroke: colors.border, strokeWidth: 0.5 },
                }}
              />

              {/* Curva P3 — mínimo OMS */}
              <VictoryLine
                data={chartData.p3}
                style={{
                  data: { stroke: '#FCA5A5', strokeWidth: 1, strokeDasharray: '4,4' },
                }}
              />

              {/* Curva P50 — promedio OMS */}
              <VictoryLine
                data={chartData.p50}
                style={{
                  data: { stroke: '#86EFAC', strokeWidth: 1.5, strokeDasharray: '4,4' },
                }}
              />

              {/* Curva P97 — máximo OMS */}
              <VictoryLine
                data={chartData.p97}
                style={{
                  data: { stroke: '#FCA5A5', strokeWidth: 1, strokeDasharray: '4,4' },
                }}
              />

              {/* Curva del bebé */}
              <VictoryLine
                data={chartData.babyData}
                style={{
                  data: { stroke: colors.primary, strokeWidth: 2.5 },
                }}
              />
            </VictoryChart>
          )}

          {/* Leyenda */}
          <View className="flex-row justify-center gap-4 mt-2">
            <LegendItem color={colors.primary} label={activeBaby.name} solid />
            <LegendItem color="#86EFAC" label="P50 OMS" />
            <LegendItem color="#FCA5A5" label="P3/P97 OMS" />
          </View>
        </View>

        {/* ── REGISTROS RECIENTES ── */}
        <View className="mx-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              Registros ({records.length})
            </Text>
          </View>

          {records.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-text-disabled text-sm text-center">
                Aún no hay registros.{'\n'}Toca + para agregar el primero.
              </Text>
            </View>
          ) : (
            // Mostramos en orden inverso — más reciente primero
            [...records].reverse().map((record) => (
              <GrowthRecordCard
                key={record.id}
                record={record}
                unit={getActiveUnit()}
                onDelete={() => onDeleteRecord(record.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── BOTÓN + FLOTANTE ── */}
      {/* position absolute no funciona con className en RN — usamos style */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ── DATE PICKER ── */}
      <DatePickerModal
        visible={showDatePicker}
        currentDate={recordDate}
        title="Fecha del registro"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setRecordDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* ── MODAL AGREGAR REGISTRO ── */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="w-10 h-1 bg-border rounded-full self-center mb-4" />

              <Text className="text-text-primary text-lg font-bold mb-1">
                Añadir Registro
              </Text>
              <Text className="text-text-secondary text-sm mb-5">
                Registra el crecimiento de {activeBaby.name}
              </Text>

              {/* Fecha */}
              <Text className="text-text-primary text-sm font-medium mb-2">
                Fecha del registro
              </Text>
              <TouchableOpacity
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 flex-row items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text className="ml-2 text-sm text-text-secondary">
                  {recordDate.toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              {/* Peso */}
              <Text className="text-text-primary text-sm font-medium mb-2">
                Peso (kg)
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: 6.5"
                placeholderTextColor={colors.textDisabled}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
              />

              {/* Talla */}
              <Text className="text-text-primary text-sm font-medium mb-2">
                Talla (cm)
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: 62"
                placeholderTextColor={colors.textDisabled}
                value={heightInput}
                onChangeText={setHeightInput}
                keyboardType="decimal-pad"
              />

              {/* Perímetro cefálico */}
              <Text className="text-text-primary text-sm font-medium mb-2">
                Perímetro cefálico (cm)
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: 40"
                placeholderTextColor={colors.textDisabled}
                value={headInput}
                onChangeText={setHeadInput}
                keyboardType="decimal-pad"
              />

              {/* Notas */}
              <Text className="text-text-primary text-sm font-medium mb-2">
                Notas (opcional)
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-6 text-text-primary"
                placeholder="Escribe algo sobre este hito..."
                placeholderTextColor={colors.textDisabled}
                value={notesInput}
                onChangeText={setNotesInput}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              {/* Botones */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border border-border rounded-xl py-3 items-center"
                  onPress={resetModal}
                  disabled={isSaving}
                >
                  <Text className="text-text-secondary font-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary rounded-xl py-3 items-center"
                  onPress={onSaveRecord}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold">Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── COMPONENTES INTERNOS ──

interface MetricCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const MetricCard = ({ label, value, icon }: MetricCardProps) => (
  // flex-1: cada tarjeta ocupa el mismo espacio en la fila
  <View className="flex-1 bg-white rounded-2xl p-3 items-center">
    <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center mb-2">
      <Ionicons name={icon} size={16} color={colors.primary} />
    </View>
    <Text className="text-text-primary font-bold text-sm text-center">
      {value}
    </Text>
    <Text className="text-text-secondary text-xs text-center mt-1">
      {label}
    </Text>
  </View>
);

interface LegendItemProps {
  color: string;
  label: string;
  solid?: boolean;
}

const LegendItem = ({ color, label, solid }: LegendItemProps) => (
  <View className="flex-row items-center gap-1">
    <View
      style={{
        width: 16,
        height: 3,
        backgroundColor: color,
        borderRadius: 2,
        // La línea del bebé es sólida, las OMS son punteadas (simulado con opacidad)
        opacity: solid ? 1 : 0.7,
      }}
    />
    <Text className="text-text-secondary text-xs">{label}</Text>
  </View>
);

interface GrowthRecordCardProps {
  record: import('../../hooks/useGrowth').GrowthRecordWithPercentile;
  unit: string;
  onDelete: () => void;
}

const GrowthRecordCard = ({ record, unit, onDelete }: GrowthRecordCardProps) => {
  const percentile = record.weightPercentile ?? record.heightPercentile ?? null;
  const percentileColor = percentile ? getPercentileColor(percentile) : colors.textDisabled;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center">
      {/* Ícono de calendario */}
      <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center mr-3">
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
      </View>

      <View className="flex-1">
        <Text className="text-text-primary font-semibold text-sm">
          {record.date.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        {/* Métricas en una fila */}
        <View className="flex-row flex-wrap gap-2 mt-1">
          {record.weight !== null && (
            <Text className="text-text-secondary text-xs">
              ⚖️ {record.weight} kg
            </Text>
          )}
          {record.height !== null && (
            <Text className="text-text-secondary text-xs">
              📏 {record.height} cm
            </Text>
          )}
          {record.headCircumference !== null && (
            <Text className="text-text-secondary text-xs">
              ⭕ {record.headCircumference} cm
            </Text>
          )}
        </View>

        {/* Notas */}
        {record.notes ? (
          <Text className="text-text-disabled text-xs mt-1" numberOfLines={1}>
            {record.notes}
          </Text>
        ) : null}
      </View>

      <View className="items-end gap-2">
        {/* Badge de percentil */}
        {percentile && (
          <View
            style={{ backgroundColor: percentileColor + '20' }}
            className="px-2 py-0.5 rounded-full"
          >
            <Text style={{ color: percentileColor }} className="text-xs font-semibold">
              {percentile}
            </Text>
          </View>
        )}

        {/* Botón eliminar */}
        <TouchableOpacity className="p-1" onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};