import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../constants/theme';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { handleRegister, isLoading, error } = useAuth();
  const navigation = useNavigation<RegisterNavigationProp>();

  const onRegisterPress = async () => {
    if (!parentName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setValidationError('Por favor completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setValidationError(null);
    await handleRegister({ parentName, email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-neutral"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <View className="flex-1 px-6 pt-14 pb-8">

          {/* ── BOTÓN REGRESAR — ícono en lugar de flecha de texto ── */}
          <TouchableOpacity
            className="self-start mb-8 p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* ── LOGO Y TÍTULOS ── */}
          <View className="items-center mb-8">
            {/* Ícono de bebé en lugar de emoji 🍼 */}
            <View className="w-20 h-20 rounded-full bg-primary mb-4 items-center justify-center">
              <Ionicons name="heart" size={36} color="#FFFFFF" />
            </View>

            <Text className="text-text-primary text-3xl font-bold mb-2">
              Únete a Bebio
            </Text>
            <Text className="text-text-secondary text-base text-center px-4">
              Comienza el seguimiento del desarrollo de tu bebé
            </Text>
          </View>

          {/* ── FORMULARIO ── */}
          <View className="w-full">
            <Text className="text-text-primary text-sm font-medium mb-2">
              Nombre del padre/madre
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary"
              placeholder="Ana García"
              placeholderTextColor="#9CA3AF"
              value={parentName}
              onChangeText={setParentName}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text className="text-text-primary text-sm font-medium mb-2">
              Correo electrónico
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary"
              placeholder="ana@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text className="text-text-primary text-sm font-medium mb-2">
              Contraseña
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text className="text-text-primary text-sm font-medium mb-2">
              Confirmar contraseña
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-4 mb-8 text-text-primary"
              placeholder="Repite tu contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {(validationError || error) && (
              <View className="bg-red-50 border border-error rounded-xl p-3 mb-4">
                <Text className="text-error text-sm text-center">
                  {validationError || error}
                </Text>
              </View>
            )}

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mb-6"
              onPress={onRegisterPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Crear cuenta
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-text-secondary text-sm">
                ¿Ya tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-primary font-bold text-sm">
                  Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}