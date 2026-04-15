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
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>

export default function RegisterScreen() {

  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null);

  const { handleRegister, isLoading, error } = useAuth();
  const navigation = useNavigation<RegisterNavigationProp>();

  const onRegisterPress = async () => {
    if (!parentName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setValidationError('Por favor completa todos los campos.');
      return;
    }

    // Validación 2: contraseñas coinciden
    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }

    // Validación 3: longitud mínima
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Si pasa todas las validaciones, limpiamos el error y procedemos
    setValidationError(null);
    await handleRegister({ parentName, email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
    >
      <ScrollView
        className='flex-1 bg-neutral'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className='flex-1 px-6 pt-14 pb-8'>

          {/* ── BOTÓN REGRESAR ── */}
          <TouchableOpacity
            className='self-start mb-8'
            onPress={() => navigation.goBack()}
          >
            <Text className='text-primary text-4x1 p-2'>←</Text>
          </TouchableOpacity>

          {/* ── SECCIÓN LOGO Y TÍTULOS ── */}
          <View className='items-center mb-8'>
            <View className='w-20 h-20 rounded-full bg-primary mb-4 items-center justify-center'>
              <Text className='text-4xl'>🍼</Text>
            </View>

            <Text className='text-text-primary text-3xl font-bold mb-2'>
              Únete a Bebio
            </Text>

            <Text className='text-text-secundary text-base text-center px-4'>
              Comienza el seguimiento del desarrollo de tu bebé
            </Text>
          </View>

          {/* ── FORMULARIO ── */}
          <View className="w-full">

            {/* -- Campo Nombre del padre -- */}
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

            {/* -- Campo Email -- */}
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

            {/* -- Campo Password -- */}
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

            {/* -- Campo Confirmar Password -- */}
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

            {/* -- Mensaje de error -- */}
            {(validationError || error) && (
              <View className="bg-red-50 border border-error rounded-xl p-3 mb-4">
                <Text className="text-error text-sm text-center">
                  {validationError || error}
                </Text>
              </View>
            )}

            {/* -- Botón Crear Cuenta -- */}
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

            {/* -- Link a Login -- */}
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