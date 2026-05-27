import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getAuth } from 'firebase/auth';
import { useBabyContext } from '../../context/BabyContext';
import { useVaccines } from '../../hooks/useVaccines';
import { useGrowth } from '../../hooks/useGrowth';
import { colors } from '../../constants/theme';
import { AppTabParamList } from '../../navigation/AppNavigator';
import AIChatScreen from './IAChatScreen';
import { GoogleGenerativeAI } from '@google/generative-ai';

type HomeNavigationProp = BottomTabNavigationProp<AppTabParamList>;

const fetchDailyTip = async (
  babyName: string,
  ageInMonths: number,
  gender: string
): Promise<string> => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

  const genderLabel = gender === 'male' ? 'niño' : 'niña';
  const prompt = `Genera UN tip corto y útil (máximo 2 oraciones) sobre el desarrollo infantil para los padres de ${babyName}, un ${genderLabel} de ${ageInMonths} meses. 
El tip debe ser específico para esa edad, práctico y positivo. 
No uses markdown, asteriscos ni emojis al inicio. Solo el texto del tip.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { activeBaby, getAgeInMonths } = useBabyContext();
  const auth = getAuth();

  const parentName = auth.currentUser?.displayName ?? 'Papá/Mamá';
  const firstName = parentName.split(' ')[0];

  const { nextVaccine, progress: vaccineProgress } = useVaccines(
    activeBaby?.id ?? null
  );
  const { latestWeight, latestHeight, records } = useGrowth(
    activeBaby?.id ?? null,
    activeBaby?.birthDate ?? null,
    activeBaby?.gender ?? null
  );

  const [aiQuery, setAiQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);

  useEffect(() => {
    if (!activeBaby) return;
    loadDailyTip();
  }, [activeBaby?.id]);

  const loadDailyTip = async () => {
    if (!activeBaby) return;
    try {
      setTipLoading(true);
      const tip = await fetchDailyTip(
        activeBaby.name,
        getAgeInMonths(activeBaby),
        activeBaby.gender
      );
      setDailyTip(tip);
    } catch {
      setDailyTip('Hablar con tu bebé frecuentemente estimula su desarrollo del lenguaje desde los primeros meses.');
    } finally {
      setTipLoading(false);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const lastRecord = records.length > 0 ? records[records.length - 1] : null;

  const getTimeSinceLastRecord = (): string => {
    if (!lastRecord) return 'Sin registros';
    const now = new Date();
    const diff = now.getTime() - lastRecord.date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Hace 1 día';
    return `Hace ${days} días`;
  };

  const onAiQuery = () => {
    if (!aiQuery.trim()) return;
    setChatInitialMessage(aiQuery.trim());
    setAiQuery('');
    setShowChat(true);
  };

  if (!activeBaby) {
    return (
      <SafeAreaView className="flex-1 bg-neutral">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">🍼</Text>
          <Text className="text-text-primary text-lg font-bold text-center mb-2">
            ¡Bienvenido a Bebio!
          </Text>
          <Text className="text-text-secondary text-sm text-center mb-6">
            Registra a tu bebé en el Perfil para comenzar el seguimiento.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-xl px-6 py-3"
            onPress={() => navigation.navigate('Profile')}
          >
            <Text className="text-white font-bold">Ir al Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ageInMonths = getAgeInMonths(activeBaby);

  const getAgeLabel = (): string => {
    if (ageInMonths < 1) return 'Recién nacido';
    if (ageInMonths < 24) return `${ageInMonths} ${ageInMonths === 1 ? 'mes' : 'meses'}`;
    const years = Math.floor(ageInMonths / 12);
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
        <View className="px-5 pt-4 pb-5">
          {/* Saludo con nombre del padre */}
          <Text className="text-text-secondary text-sm">
            {getGreeting()}, {firstName} 👋
          </Text>
          {/* Nombre del bebé como título principal */}
          <Text className="text-text-primary text-2xl font-bold">
            {activeBaby.name}
          </Text>
          {/* Chip con género y edad del bebé */}
          <View className="flex-row items-center mt-2">
            <View className="bg-primary-light px-3 py-1 rounded-full flex-row items-center">
              <Text className="text-primary text-xs font-semibold mr-1">
                {activeBaby.gender === 'male' ? '👦' : '👧'}
              </Text>
              <Text className="text-primary text-xs font-semibold">
                {getAgeLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* ── CARDS RESUMEN ── */}
        <View className="flex-row mx-5 mb-5 gap-3">
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4"
            onPress={() => navigation.navigate('Vaccines')}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mb-2">
              <Ionicons name="medkit-outline" size={16} color="#3B82F6" />
            </View>
            <Text className="text-text-primary font-bold text-lg">
              {vaccineProgress.applied}
            </Text>
            <Text className="text-text-secondary text-xs">
              de {vaccineProgress.total} vacunas
            </Text>
            <View className="bg-blue-100 rounded-full h-1.5 mt-2">
              <View
                className="bg-blue-400 rounded-full h-1.5"
                style={{ width: `${vaccineProgress.percentage}%` }}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4"
            onPress={() => navigation.navigate('Growth')}
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mb-2">
              <Ionicons name="stats-chart-outline" size={16} color="#10B981" />
            </View>
            <Text className="text-text-primary font-bold text-lg">
              {latestWeight !== null ? `${latestWeight}kg` : '—'}
            </Text>
            <Text className="text-text-secondary text-xs">
              {latestHeight !== null ? `${latestHeight}cm` : 'Sin registros'}
            </Text>
            <Text className="text-text-disabled text-xs mt-1">
              {getTimeSinceLastRecord()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── TIP DEL DÍA ── */}
        <View className="mx-5 mb-5">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Tip del día
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mr-2">
                <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
              </View>
              <Text className="text-text-primary font-semibold text-sm">
                Para {activeBaby.name} — {getAgeLabel()}
              </Text>
            </View>

            {tipLoading ? (
              <View className="flex-row items-center gap-2 py-2">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="text-text-secondary text-sm">
                  Generando tip personalizado...
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-text-secondary text-sm leading-5">
                  {dailyTip}
                </Text>
                {/* Botón para regenerar el tip */}
                <TouchableOpacity
                  className="self-end mt-3 flex-row items-center gap-1"
                  onPress={loadDailyTip}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <Text className="text-primary text-xs font-medium">
                    Nuevo tip
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* ── PRÓXIMA VACUNA ── */}
        {nextVaccine && (
          <View className="mx-5 mb-5">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Próxima vacuna
            </Text>
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 flex-row items-center"
              onPress={() => navigation.navigate('Vaccines')}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-3">
                <Ionicons name="medical-outline" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-sm">
                  {nextVaccine.name}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {nextVaccine.ageLabel}
                  {nextVaccine.scheduledDate
                    ? ` • ${nextVaccine.scheduledDate.toLocaleDateString('es-CO')}`
                    : ''}
                </Text>
              </View>
              <View className="bg-yellow-100 px-2 py-1 rounded-full">
                <Text className="text-yellow-700 text-xs font-semibold">
                  PENDIENTE
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ÚLTIMO REGISTRO ── */}
        {lastRecord && (
          <View className="mx-5 mb-5">
            <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Último registro
            </Text>
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 flex-row items-center"
              onPress={() => navigation.navigate('Growth')}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center mr-3">
                <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-sm">
                  {lastRecord.date.toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  {lastRecord.weight !== null && (
                    <Text className="text-text-secondary text-xs">
                      ⚖️ {lastRecord.weight}kg
                    </Text>
                  )}
                  {lastRecord.height !== null && (
                    <Text className="text-text-secondary text-xs">
                      📏 {lastRecord.height}cm
                    </Text>
                  )}
                </View>
              </View>
              <Text className="text-text-disabled text-xs">
                {getTimeSinceLastRecord()}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CONSULTAR CON IA ── */}
        <View className="mx-5 mb-5">
          <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Consultar con IA
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                <Ionicons name="sparkles-outline" size={16} color="#8B5CF6" />
              </View>
              <View>
                <Text className="text-text-primary font-semibold text-sm">
                  Asistente Bebio
                </Text>
                <Text className="text-text-secondary text-xs">
                  Pregunta sobre el desarrollo de {activeBaby.name}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-neutral border border-border rounded-xl px-3 py-2">
              <TextInput
                className="flex-1 text-text-primary text-sm"
                placeholder={`¿Cómo va el desarrollo de ${activeBaby.name}?`}
                placeholderTextColor={colors.textDisabled}
                value={aiQuery}
                onChangeText={setAiQuery}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={onAiQuery}
              />
              <TouchableOpacity
                className={`w-8 h-8 rounded-full items-center justify-center ml-2 ${aiQuery.trim() ? 'bg-primary' : 'bg-border'
                  }`}
                onPress={onAiQuery}
                disabled={!aiQuery.trim()}
              >
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={aiQuery.trim() ? '#FFFFFF' : colors.textDisabled}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── MODAL CHAT IA ── */}
      <AIChatScreen
        visible={showChat}
        initialMessage={chatInitialMessage}
        onClose={() => setShowChat(false)}
      />
    </SafeAreaView>
  );
}