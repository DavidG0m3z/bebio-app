import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '@google/generative-ai';
import { useBabyContext } from '../../context/BabyContext';
import { useVaccines } from '../../hooks/useVaccines';
import { useGrowth } from '../../hooks/useGrowth';
import { colors } from '../../constants/theme';
import {
  createChatSession,
  sendMessage,
  ChatMessage,
  BabyContext,
} from '../../services/api/geminiService';

interface AIChatScreenProps {
  visible: boolean;
  initialMessage: string;
  onClose: () => void;
}

export default function AIChatScreen({
  visible,
  initialMessage,
  onClose,
}: AIChatScreenProps) {
  const { activeBaby, getAgeInMonths } = useBabyContext();

  const { appliedVaccines, nextVaccine } = useVaccines(
    activeBaby?.id ?? null
  );

  const { latestWeight, latestHeight, latestHead, records } = useGrowth(
    activeBaby?.id ?? null,
    activeBaby?.birthDate ?? null,
    activeBaby?.gender ?? null
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chatSessionRef = useRef<ChatSession | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && activeBaby && initialMessage) {
      initializeChat();
    }
  }, [visible, activeBaby]);

  const initializeChat = async () => {
    if (!activeBaby) return;

    try {
      setIsInitializing(true);
      setMessages([]);
      setError(null);

      const lastRecord = records[records.length - 1];
      const babyContext: BabyContext = {
        baby: activeBaby,
        ageInMonths: getAgeInMonths(activeBaby),
        latestWeight,
        latestHeight,
        latestHead,
        lastWeightPercentile: lastRecord?.weightPercentile ?? null,
        lastHeightPercentile: lastRecord?.heightPercentile ?? null,
        appliedVaccines,
        nextVaccine: nextVaccine ?? null,
        recentRecords: records.slice(-5),
      };

      chatSessionRef.current = createChatSession(babyContext);

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: initialMessage,
        timestamp: new Date(),
      };
      setMessages([userMessage]);
      setIsInitializing(false);

      await sendFirstMessage(chatSessionRef.current, initialMessage);
    } catch (err: any) {
      if (err?.message?.includes('429')) {
        setError('Límite de uso alcanzado. Intenta en unos minutos.');
      } else {
        setError('No se pudo iniciar el chat. Verifica tu conexión.');
      }
      setIsInitializing(false);
    }
  };

  const sendFirstMessage = async (session: ChatSession, message: string) => {
    try {
      setIsLoading(true);
      const response = await sendMessage(session, message);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError('No se pudo obtener respuesta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSendMessage = async () => {
    if (!inputText.trim() || !chatSessionRef.current || isLoading) return;

    const userText = inputText.trim();
    setInputText('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      setIsLoading(true);
      setError(null);
      const response = await sendMessage(chatSessionRef.current, userText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onClose_ = () => {
    setMessages([]);
    setInputText('');
    setError(null);
    chatSessionRef.current = null;
    onClose();
  };

  const onContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose_}
    >
      {/* Fondo semitransparente */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          {/* Contenedor principal con bordes redondeados arriba */}
          <View style={{
            backgroundColor: colors.neutral,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: '92%',
            overflow: 'hidden',
          }}>

            {/* ── HANDLE DECORATIVO ── */}
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 4,
            }} />

            {/* ── HEADER ── */}
            <View style={{
              backgroundColor: '#FFFFFF',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              {/* Botón cerrar */}
              <TouchableOpacity
                onPress={onClose_}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.neutral,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Avatar IA */}
              <View style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#EDE9FE',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}>
                <Ionicons name="sparkles" size={18} color="#8B5CF6" />
              </View>

              {/* Título */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: colors.textPrimary,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                  Asistente Bebio
                </Text>
                {activeBaby && (
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {activeBaby.name} • {getAgeInMonths(activeBaby)} meses
                  </Text>
                )}
              </View>

              {/* Badge online */}
              <View style={{
                backgroundColor: '#DCFCE7',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
              }}>
                <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: '600' }}>
                  IA activa
                </Text>
              </View>
            </View>

            {/* ── MENSAJES ── */}
            {isInitializing ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#EDE9FE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
                <Text style={{
                  color: colors.textPrimary,
                  fontWeight: '600',
                  fontSize: 15,
                  marginBottom: 4,
                }}>
                  Preparando contexto
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Cargando datos de {activeBaby?.name}...
                </Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={onContentSizeChange}
              >
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {/* Indicador de escritura */}
                {isLoading && (
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderBottomLeftRadius: 4,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      Escribiendo...
                    </Text>
                  </View>
                )}

                {/* Error */}
                {error && (
                  <View style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.error,
                  }}>
                    <Text style={{
                      color: colors.error,
                      fontSize: 13,
                      textAlign: 'center',
                    }}>
                      {error}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* ── INPUT ── */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: colors.border,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
            }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colors.neutral,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: colors.textPrimary,
                  maxHeight: 100,
                }}
                placeholder="Escribe tu pregunta..."
                placeholderTextColor={colors.textDisabled}
                value={inputText}
                onChangeText={setInputText}
                multiline
                returnKeyType="send"
                onSubmitEditing={onSendMessage}
                editable={!isLoading && !isInitializing}
              />
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: inputText.trim() && !isLoading
                    ? '#8B5CF6'
                    : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={onSendMessage}
                disabled={!inputText.trim() || isLoading || isInitializing}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={inputText.trim() && !isLoading ? '#FFFFFF' : colors.textDisabled}
                />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── COMPONENTE BURBUJA ──

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <View style={{
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '82%',
      marginBottom: 12,
    }}>
      {/* Avatar IA */}
      {!isUser && (
        <View style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#EDE9FE',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
        }}>
          <Ionicons name="sparkles" size={13} color="#8B5CF6" />
        </View>
      )}

      {/* Burbuja */}
      <View style={{
        backgroundColor: isUser ? colors.primary : '#FFFFFF',
        borderRadius: 18,
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
      }}>
        <Text style={{
          color: isUser ? '#FFFFFF' : colors.textPrimary,
          fontSize: 14,
          lineHeight: 21,
        }}>
          {message.text}
        </Text>
      </View>

      {/* Hora */}
      <Text style={{
        color: colors.textDisabled,
        fontSize: 10,
        marginTop: 3,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}>
        {message.timestamp.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};