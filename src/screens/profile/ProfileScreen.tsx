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
import { getAuth } from 'firebase/auth';
import { useBabyContext, Baby, Gender } from '../../context/BabyContext';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/theme';
import DatePickerModal from '../../components/common/DatePickerModal';

export default function ProfileScreen() {
  const { babies, activeBaby, isLoading, error, setActiveBaby, addBaby, deleteBaby } =
    useBabyContext();
  const { handleLogout } = useAuth();

  const auth = getAuth();
  const user = auth.currentUser;

  const [showAddModal, setShowAddModal] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [babyGender, setBabyGender] = useState<Gender>('male');
  const [babyBirthDate, setBabyBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Limpia todo el estado del modal al cerrar
  // Esto corrige el bug donde el botón "Agregar" dejaba de funcionar
  const resetModal = () => {
    setBabyName('');
    setBabyGender('male');
    setBabyBirthDate(new Date());
    setShowDatePicker(false);
    setShowAddModal(false);
  };

  const onAddBaby = async () => {
    if (!babyName.trim()) return;
    try {
      setIsSaving(true);
      await addBaby(babyName.trim(), babyBirthDate, babyGender);
      resetModal();
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteBaby = (baby: Baby) => {
    Alert.alert(
      'Eliminar bebé',
      `¿Deseas eliminar a "${baby.name}"? Se eliminarán todos sus datos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteBaby(baby.id),
        },
      ]
    );
  };

  const onLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const formatBirthDate = (date: Date): string => {
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getAgeLabel = (birthDate: Date): string => {
    const now = new Date();
    const months =
      (now.getFullYear() - birthDate.getFullYear()) * 12 +
      (now.getMonth() - birthDate.getMonth());

    if (months < 1) return 'Recién nacido';
    if (months < 24) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    const years = Math.floor(months / 12);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── HEADER ── */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-text-primary text-2xl font-bold">Perfil</Text>
        </View>

        {/* ── TARJETA DEL PADRE ── */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-5">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mr-4">
              <Text className="text-white text-2xl font-bold">
                {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-lg font-bold">
                {user?.displayName ?? 'Usuario'}
              </Text>
              <Text className="text-text-secondary text-sm">
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* ── SECCIÓN MIS BEBÉS ── */}
        <View className="mx-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
              Mis bebés
            </Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text className="text-primary text-sm font-semibold ml-1">
                Agregar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Estado de carga — spinner solo durante la carga inicial */}
          {isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.primary} />
              <Text className="text-text-secondary text-sm mt-2">
                Cargando...
              </Text>
            </View>
          ) : babies.length === 0 ? (
            // Estado vacío — mensaje amigable en lugar de spinner infinito
            <TouchableOpacity
              className="bg-white border-2 border-dashed border-primary rounded-2xl p-6 items-center"
              onPress={() => setShowAddModal(true)}
            >
              <Text className="text-4xl mb-2">🍼</Text>
              <Text className="text-text-primary font-semibold text-base mb-1">
                ¡Agrega a tu bebé!
              </Text>
              <Text className="text-text-secondary text-sm text-center">
                Aún no has registrado ningún bebé.{'\n'}
                Toca aquí para comenzar el seguimiento.
              </Text>
            </TouchableOpacity>
          ) : (
            babies.map((baby) => (
              <BabyCard
                key={baby.id}
                baby={baby}
                isActive={activeBaby?.id === baby.id}
                ageLabel={getAgeLabel(baby.birthDate)}
                onSelect={() => setActiveBaby(baby)}
                onDelete={() => onDeleteBaby(baby)}
              />
            ))
          )}

          {error && (
            <View className="bg-red-50 border border-error rounded-xl p-3 mt-3">
              <Text className="text-error text-sm text-center">{error}</Text>
            </View>
          )}
        </View>

        {/* ── SECCIÓN CUENTA ── */}
        <View className="mx-5 mb-6">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Cuenta
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden">
            <SettingsRow
              icon="notifications-outline"
              label="Notificaciones"
              sublabel="Recordatorios y alertas"
              onPress={() => { }}
            />
            <SettingsRow
              icon="lock-closed-outline"
              label="Privacidad"
              sublabel="Datos y seguridad"
              onPress={() => { }}
              isLast
            />
          </View>
        </View>

        {/* ── BOTÓN CERRAR SESIÓN ── */}
        <TouchableOpacity
          className="mx-5 bg-red-50 border border-red-200 rounded-2xl py-4 items-center flex-row justify-center"
          onPress={onLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text className="text-error font-bold text-base ml-2">
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        <Text className="text-text-disabled text-xs text-center mt-4">
          Bebio v1.0.0
        </Text>
      </ScrollView>

      {/* ── MODAL AGREGAR BEBÉ ── */}
      <Modal
        visible={showAddModal}
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

              <Text className="text-text-primary text-lg font-bold mb-5">
                Nuevo bebé
              </Text>

              <Text className="text-text-primary text-sm font-medium mb-2">
                Nombre del bebé
              </Text>
              <TextInput
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                placeholder="Ej: Leo"
                placeholderTextColor={colors.textDisabled}
                value={babyName}
                onChangeText={setBabyName}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Text className="text-text-primary text-sm font-medium mb-2">
                Fecha de nacimiento
              </Text>
              <TouchableOpacity
                className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 flex-row items-center"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text className="ml-2 text-sm text-text-secondary">
                  {formatBirthDate(babyBirthDate)}
                </Text>
              </TouchableOpacity>

              <Text className="text-text-primary text-sm font-medium mb-2">
                Género
              </Text>
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  className={`flex-1 rounded-xl py-3 items-center border-2 ${babyGender === 'male'
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border'
                    }`}
                  onPress={() => setBabyGender('male')}
                >
                  <Text className="text-xl mb-1">👦</Text>
                  <Text className={`text-sm font-semibold ${babyGender === 'male' ? 'text-white' : 'text-text-secondary'
                    }`}>
                    Niño
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-xl py-3 items-center border-2 ${babyGender === 'female'
                      ? 'bg-primary border-primary'
                      : 'bg-white border-border'
                    }`}
                  onPress={() => setBabyGender('female')}
                >
                  <Text className="text-xl mb-1">👧</Text>
                  <Text className={`text-sm font-semibold ${babyGender === 'female' ? 'text-white' : 'text-text-secondary'
                    }`}>
                    Niña
                  </Text>
                </TouchableOpacity>
              </View>

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
                  onPress={onAddBaby}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold">Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* DatePickerModal DENTRO del Modal para evitar
                  conflicto de z-index que impedía que se abriera */}
              <DatePickerModal
                visible={showDatePicker}
                currentDate={babyBirthDate}
                title="Fecha de nacimiento"
                maximumDate={new Date()}
                onConfirm={(date) => {
                  setBabyBirthDate(date);
                  setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
              />

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

interface BabyCardProps {
  baby: Baby;
  isActive: boolean;
  ageLabel: string;
  onSelect: () => void;
  onDelete: () => void;
}

const BabyCard = ({ baby, isActive, ageLabel, onSelect, onDelete }: BabyCardProps) => (
  <TouchableOpacity
    className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center border-2 ${isActive ? 'border-primary' : 'border-transparent'
      }`}
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${isActive ? 'bg-primary' : 'bg-primary-light'
      }`}>
      <Text className="text-2xl">
        {baby.gender === 'male' ? '👦' : '👧'}
      </Text>
    </View>

    <View className="flex-1">
      <View className="flex-row items-center">
        <Text className="text-text-primary font-bold text-base mr-2">
          {baby.name}
        </Text>
        {isActive && (
          <View className="bg-primary px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-semibold">Activo</Text>
          </View>
        )}
      </View>
      <Text className="text-text-secondary text-sm">{ageLabel}</Text>
    </View>

    <TouchableOpacity className="p-2" onPress={onDelete}>
      <Ionicons name="trash-outline" size={18} color={colors.error} />
    </TouchableOpacity>
  </TouchableOpacity>
);

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
  isLast?: boolean;
}

const SettingsRow = ({ icon, label, sublabel, onPress, isLast }: SettingsRowProps) => (
  <TouchableOpacity
    className={`flex-row items-center px-4 py-4 ${!isLast ? 'border-b border-border' : ''
      }`}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="w-8 h-8 rounded-full bg-primary-light items-center justify-center mr-3">
      <Ionicons name={icon} size={16} color={colors.primary} />
    </View>
    <View className="flex-1">
      <Text className="text-text-primary text-sm font-semibold">{label}</Text>
      <Text className="text-text-secondary text-xs">{sublabel}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
  </TouchableOpacity>
);