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

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;


export default function LoginScreen() {

  const { handleLogin, isLoading, error } = useAuth();
  const navigation = useNavigation<LoginNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onLoginPress = async () => {
    //if (!email || !password) return;
    //await handleLogin({ email, password });
    const success = await handleLogin({ email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
    >
      <ScrollView
        className='flex-1 bg-neutral'
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className='flex-1 px-6 justify-center items-center'>

          {/* -- LOGO -- */}
          <View className='w-24 h-24 rounded-full bg-primary mb-6 items-center justify-center' >
            <Text className='text-5xl'>🍼</Text>
          </View>

          {/* -- TITULOS -- */}
          <Text className='text-text-primary text-3xl font-bold mb-1'>
            Bebio
          </Text>

          <Text className='text-text-secundary text-base mb-10'>
            Bienvenido de nuevo
          </Text>

          {/* -- FORMULARIO -- */}
          <View className='w-full'>
            <Text className='text-text-primary text-sm font-medium mb-2'>
              Email
            </Text>
            <TextInput
              className='bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary'
              placeholder='hola@ejemplo.com'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
            />
            <Text>
              Contraseña
            </Text>
            <TextInput
              className='bg-white border border-border rounded-xl px-4 py-4 mb-4 text-text-primary'
              placeholder='••••••••'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity className='self-end mb-6'>
              <Text className='text-primary text-sm font-medium'>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {error && (
              <View className='bg-red-50 border border border-error rounded-xl p-3 mb-4'>
                <Text className='text-error text-sm text-center'>{error}</Text>
              </View>
            )}

            {/* -- BOTON LOGIN -- */}
            <TouchableOpacity
              className='bg-primary rounded-xl py-4 items-center mb-6'
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

            <View className='flex-row items-center mb-6' >
              <View className='flex-1 h-px bg-border' />
              <Text className='mx-4 text-text-secundary text-sm' >o</Text>
              <View className='flex-1 h-px bg-border' />
            </View>

            {/* -- BOTONES GOOGLE APPLE -- */}
            <View className='flex-row gap-3 mb-8' >
              <TouchableOpacity className='flex-1 border border-border rounded-xl py-3 items-center bg-white'>
                <Text className='text-text-primary font-medium text-sm'>
                  🌐
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className='flex-1 border border-border rounded-xl py-3 items-center bg-white'>
                <Text className='text-text-primary font-medium text-sm'>
                  🍎
                </Text>
              </TouchableOpacity>
            </View>

            {/* -- Registro -- */}
            <View className='flex-row justify-center'>
              <Text className='text-text-secundary text-sm'>
                ¿No tienes cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className='text-primary font-bold text-sm'>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}