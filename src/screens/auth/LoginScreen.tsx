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
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import { Image } from 'react-native';

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const { handleLogin, handleForgotPassword, isLoading, error } = useAuth();
  const navigation = useNavigation<LoginNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const onLoginPress = async () => {
    if (!email || !password) return;
    await handleLogin({ email, password });
  };

  const onForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Ingresa tu correo electrónico.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    const success = await handleForgotPassword(forgotEmail.trim());
    setForgotLoading(false);
    if (success) {
      setForgotSuccess(true);
    } else {
      setForgotError('No se pudo enviar el correo. Verifica tu email.');
    }
  };

  const resetForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError(null);
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
        <View className="flex-1 px-6 pt-10 items-center">

          <Image
            source={require('../../../assets/loginLetrasV3.png')}
            style={{ width: 450, height: 350, marginBottom: 1 }}
            resizeMode="contain"
          />

          {/* ── FORMULARIO ── */}
          <View className="w-full">
            <Text className="text-text-primary text-sm font-medium mb-2">
              Correo electrónico
            </Text>
            <TextInput
              className="bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary"
              placeholder="hola@ejemplo.com"
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
              className="bg-white border border-border rounded-xl px-4 py-4 mb-2 text-text-primary"
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* ── OLVIDASTE CONTRASEÑA ── */}
            <TouchableOpacity
              className="self-end mb-6"
              onPress={() => setShowForgotModal(true)}
            >
              <Text className="text-primary text-sm font-medium">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* ── ERROR ── */}
            {error && (
              <View className="bg-red-50 border border-error rounded-xl p-3 mb-4">
                <Text className="text-error text-sm text-center">{error}</Text>
              </View>
            )}

            {/* ── BOTÓN LOGIN ── */}
            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mb-6"
              onPress={onLoginPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>

            {/* ── SEPARADOR ── */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-secondary text-sm">o</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* ── BOTONES SOCIALES (decorativos) ── */}
            {/* <View className="flex-row gap-3 mb-8">
              <TouchableOpacity className="flex-1 border border-border rounded-xl py-3 items-center bg-white">
                <Text className="text-text-primary font-medium text-sm">🌐 Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 border border-border rounded-xl py-3 items-center bg-white">
                <Text className="text-text-primary font-medium text-sm">🍎 Apple</Text>
              </TouchableOpacity>
            </View> */}

            {/* ── LINK REGISTRO ── */}
            <View className="flex-row justify-center">
              <Text className="text-text-secondary text-sm">
                ¿No tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary font-bold text-sm">
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── MODAL OLVIDÉ MI CONTRASEÑA ── */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={resetForgotModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">

              {/* Handle decorativo */}
              <View className="w-10 h-1 bg-border rounded-full self-center mb-4" />

              {forgotSuccess ? (
                // Estado de éxito
                <View className="items-center py-4">
                  <Text className="text-4xl mb-4">📧</Text>
                  <Text className="text-text-primary text-lg font-bold text-center mb-2">
                    Correo enviado
                  </Text>
                  <Text className="text-text-secondary text-sm text-center mb-6">
                    Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                  </Text>
                  <TouchableOpacity
                    className="bg-primary rounded-xl py-3 px-8 items-center"
                    onPress={resetForgotModal}
                  >
                    <Text className="text-white font-bold">Entendido</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Formulario
                <>
                  <Text className="text-text-primary text-lg font-bold mb-2">
                    Restablecer contraseña
                  </Text>
                  <Text className="text-text-secondary text-sm mb-5">
                    Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                  </Text>

                  <Text className="text-text-primary text-sm font-medium mb-2">
                    Correo electrónico
                  </Text>
                  <TextInput
                    className="bg-neutral border border-border rounded-xl px-4 py-3 mb-4 text-text-primary"
                    placeholder="hola@ejemplo.com"
                    placeholderTextColor="#9CA3AF"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {forgotError && (
                    <View className="bg-red-50 border border-error rounded-xl p-3 mb-4">
                      <Text className="text-error text-sm text-center">
                        {forgotError}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 border border-border rounded-xl py-3 items-center"
                      onPress={resetForgotModal}
                      disabled={forgotLoading}
                    >
                      <Text className="text-text-secondary font-semibold">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-primary rounded-xl py-3 items-center"
                      onPress={onForgotPassword}
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text className="text-white font-bold">Enviar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}