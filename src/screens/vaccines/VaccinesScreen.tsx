import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useVaccines } from '../../hooks/useVaccines';
import { Vaccine } from '../../services/firebase/vaccineService';
import { colors } from '../../constants/theme';
import DatePickerModal from '../../components/common/DatePickerModal';

export default function VaccinesScreen() {
  const {
    isLoading,
    error,
    appliedVaccines,
    nextVaccine,
    vaccinesByAge,
    progress,
    handleMarkAsApplied,
    handleMarkAsPending,
    handleAddCustomVaccine,
    handleDeleteCustomVaccine,
    handleScheduleVaccine,
  } = useVaccines();

  const [searchQuery, setSearchQuery] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => {
      const firstKey = Object.keys(vaccinesByAge)[0];
      return firstKey ? { [firstKey]: true } : {};
    }
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAgeLabel, setCustomAgeLabel] = useState('');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const toggleGroup = (ageLabel: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [ageLabel]: !prev[ageLabel],
    }));
  };

  const filteredApplied = appliedVaccines.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByAge = Object.entries(vaccinesByAge).reduce(
    (acc, [age, vaccines]) => {
      const filtered = vaccines.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) acc[age] = filtered;
      return acc;
    },
    {} as Record<string, Vaccine[]>
  );

  const onMarkAsApplied = async () => {
    if (!nextVaccine) return;
    await handleMarkAsApplied(nextVaccine.id, scheduledDate);
  };

  const onAddCustomVaccine = async () => {
    if (!customName.trim() || !customAgeLabel.trim()) return;
    await handleAddCustomVaccine(customName, customAgeLabel, customDate);
    setCustomName('');
    setCustomAgeLabel('');
    setCustomDate(null);
    setShowAddModal(false);
  };

  const onDeleteVaccine = (vaccine: Vaccine) => {
    Alert.alert(
      'Eliminar vacuna',
      `¿Deseas eliminar "${vaccine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => handleDeleteCustomVaccine(vaccine.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-text-secondary mt-3">Cargando vacunas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── HEADER ── */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-text-primary text-2xl font-bold">
            Vacunas
          </Text>
          <Text className="text-text-secondary text-sm">
            Esquema de vacunación de tu bebé
          </Text>
        </View>

        {/* ── BANNER PROGRESO ── */}
        <View className="mx-5 mb-5 rounded-2xl overflow-hidden">
          <View className="bg-primary p-5">
            <View className="flex-row items-center mb-1">
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <Text className="text-white font-bold text-lg ml-2">
                Immunity Track
              </Text>
            </View>
            <Text className="text-white text-sm mb-4 opacity-90">
              {progress.applied} de {progress.total} vacunas completadas
            </Text>
            <View className="bg-white/30 rounded-full h-3">
              <View
                className="bg-white rounded-full h-3"
                style={{ width: `${progress.percentage}%` }}
              />
            </View>
            <Text className="text-white text-xs mt-2 opacity-90">
              {progress.percentage}% completado
            </Text>
          </View>
        </View>

        {/* ── BUSCADOR ── */}
        <View className="mx-5 mb-5">
          <View className="flex-row bg-white border border-border rounded-xl px-4 py-3 items-center">
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              className="flex-1 ml-2 text-text-primary text-sm"
              placeholder="Buscar vacunas..."
              placeholderTextColor={colors.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* ── ERROR ── */}
        {error && (
          <View className="mx-5 mb-4 bg-red-50 border border-error rounded-xl p-3">
            <Text className="text-error text-sm text-center">{error}</Text>
          </View>
        )}

        {/* ── PRÓXIMA VACUNA ── */}
        {nextVaccine && !searchQuery && (
          <View className="mx-5 mb-5">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Próxima vacuna
            </Text>
            <View className="bg-white rounded-2xl p-4 border-l-4 border-l-primary">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-text-secondary text-xs font-medium">
                  {nextVaccine.ageLabel.toUpperCase()}
                </Text>
                <View className="bg-yellow-100 px-2 py-1 rounded-full">
                  <Text className="text-yellow-700 text-xs font-semibold">
                    PENDIENTE
                  </Text>
                </View>
              </View>

              <Text className="text-text-primary font-bold text-base mb-1">
                {nextVaccine.name}
              </Text>
              <Text className="text-text-secondary text-sm mb-4">
                {nextVaccine.description}
              </Text>

              {/* Selector de fecha programada */}
              <View className="bg-primary-light rounded-xl p-3 mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text className="text-primary text-sm font-medium ml-2">
                      Fecha programada:
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="bg-white px-3 py-1 rounded-lg border border-primary"
                    onPress={() => setShowSchedulePicker(true)}
                  >
                    <Text className="text-primary font-semibold text-sm">
                      {nextVaccine.scheduledDate
                        ? nextVaccine.scheduledDate.toLocaleDateString('es-CO')
                        : scheduledDate.toLocaleDateString('es-CO')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-3 items-center"
                onPress={onMarkAsApplied}
              >
                <Text className="text-white font-bold text-sm">
                  ✓ Marcar como aplicada
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── VACUNAS APLICADAS ── */}
        {filteredApplied.length > 0 && (
          <View className="mx-5 mb-5">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Aplicadas ({filteredApplied.length})
            </Text>
            {filteredApplied.map((vaccine) => (
              <VaccineCard
                key={vaccine.id}
                vaccine={vaccine}
                onUndo={() => handleMarkAsPending(vaccine.id)}
                onDelete={
                  vaccine.isCustom ? () => onDeleteVaccine(vaccine) : undefined
                }
              />
            ))}
          </View>
        )}

        {/* ── VACUNAS POR ETAPAS (plegables) ── */}
        {Object.entries(filteredByAge).length > 0 && (
          <View className="mx-5 mb-5">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Por etapas
            </Text>
            {Object.entries(filteredByAge).map(([ageLabel, vaccines]) => (
              <AgeGroup
                key={ageLabel}
                ageLabel={ageLabel}
                vaccines={vaccines}
                isExpanded={!!expandedGroups[ageLabel]}
                onToggle={() => toggleGroup(ageLabel)}
                onDelete={(v) => v.isCustom && onDeleteVaccine(v)}
              />
            ))}
          </View>
        )}

        {/* ── BOTÓN AGREGAR VACUNA PERSONALIZADA ── */}
        <TouchableOpacity
          className="mx-5 border-2 border-dashed border-primary rounded-2xl py-4 items-center flex-row justify-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text className="text-primary font-semibold ml-2">
            Agregar vacuna personalizada
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── DATE PICKER — Fecha programada próxima vacuna ── */}
      <DatePickerModal
        visible={showSchedulePicker}
        currentDate={scheduledDate}
        title="Fecha programada"
        onConfirm={(date) => {
          setScheduledDate(date);
          setShowSchedulePicker(false);
          if (nextVaccine) handleScheduleVaccine(nextVaccine.id, date);
        }}
        onCancel={() => setShowSchedulePicker(false)}
      />

      {/* ── DATE PICKER — Vacuna personalizada ── */}
      {showAddModal && (
        <DatePickerModal
          visible={showCustomDatePicker}
          currentDate={customDate ?? new Date()}
          title="Fecha programada"
          onConfirm={(date) => {
            setCustomDate(date);
            setShowCustomDatePicker(false);
          }}
          onCancel={() => setShowCustomDatePicker(false)}
        />
      )}

      {/* ── MODAL AGREGAR VACUNA PERSONALIZADA ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">

              {/* Handle decorativo */}
              <View className="w-10 h-1 bg-border rounded-full self-center mb-4" />

              <Text className="text-text-primary text-lg font-bold mb-5">
                Nueva vacuna
              </Text>

              <Text className="text-text-primary text-sm font-medium mb-2">
                Nombre de la vacuna
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: Hepatitis A"
                placeholderTextColor={colors.textDisabled}
                value={customName}
                onChangeText={setCustomName}
              />

              <Text className="text-text-primary text-sm font-medium mb-2">
                Etapa de edad
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: 12 meses"
                placeholderTextColor={colors.textDisabled}
                value={customAgeLabel}
                onChangeText={setCustomAgeLabel}
              />

              <Text className="text-text-primary text-sm font-medium mb-2">
                Fecha programada (opcional)
              </Text>
              <TouchableOpacity
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-6 flex-row items-center"
                onPress={() => setShowCustomDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text className="ml-2 text-sm text-text-secondary">
                  {customDate
                    ? customDate.toLocaleDateString('es-CO')
                    : 'Seleccionar fecha'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border border-border rounded-xl py-3 items-center"
                  onPress={() => {
                    setCustomName('');
                    setCustomAgeLabel('');
                    setCustomDate(null);
                    setShowAddModal(false);
                  }}
                >
                  <Text className="text-text-secondary font-semibold">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary rounded-xl py-3 items-center"
                  onPress={onAddCustomVaccine}
                >
                  <Text className="text-white font-bold">Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}


interface VaccineCardProps {
  vaccine: Vaccine;
  onUndo: () => void;
  onDelete?: () => void;
}

const VaccineCard = ({ vaccine, onUndo, onDelete }: VaccineCardProps) => (
  <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center">
    <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
      <Ionicons name="checkmark-circle" size={22} color="#10B981" />
    </View>
    <View className="flex-1">
      <Text className="text-text-primary font-semibold text-sm">
        {vaccine.name}
      </Text>
      <Text className="text-text-secondary text-xs">
        {vaccine.ageLabel} •{' '}
        {vaccine.appliedDate
          ? vaccine.appliedDate.toLocaleDateString('es-CO')
          : 'Sin fecha'}
      </Text>
    </View>
    <View className="flex-row items-center gap-2">
      <TouchableOpacity className="p-2" onPress={onUndo}>
        <Ionicons
          name="arrow-undo-outline"
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity className="p-2" onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

interface AgeGroupProps {
  ageLabel: string;
  vaccines: Vaccine[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (vaccine: Vaccine) => void;
}

const AgeGroup = ({
  ageLabel,
  vaccines,
  isExpanded,
  onToggle,
  onDelete,
}: AgeGroupProps) => (
  <View className="mb-3">
    <TouchableOpacity
      className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3"
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-primary mr-2" />
        <Text className="text-text-primary font-semibold text-sm">
          {ageLabel}
        </Text>
        <View className="ml-2 bg-primary-light px-2 py-0.5 rounded-full">
          <Text className="text-primary text-xs font-medium">
            {vaccines.length}
          </Text>
        </View>
      </View>
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={colors.textSecondary}
      />
    </TouchableOpacity>

    {isExpanded && (
      <View className="bg-white rounded-2xl overflow-hidden mt-1">
        {vaccines.map((vaccine, index) => (
          <View
            key={vaccine.id}
            className={`p-4 flex-row items-center ${index > 0 ? 'border-t border-border' : ''
              }`}
          >
            <View className="w-8 h-8 rounded-full border-2 border-border items-center justify-center mr-3">
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textDisabled}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-sm font-medium">
                {vaccine.name}
              </Text>
              <Text className="text-text-secondary text-xs">
                {vaccine.description}
              </Text>
            </View>
            {vaccine.isCustom && (
              <TouchableOpacity
                className="p-2"
                onPress={() => onDelete(vaccine)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.error}
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    )}
  </View>
);