import { useState, useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../services/firebase/config';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
  Login: undefined,
  Register: undefined,
};

export type AppStackParamList = {
  Dashboard: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppNavigatorStack = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen
      name="Dashboard"
      component={() => (
        <View className="flex-1 items-center justify-center bg-neutral">
        </View>
      )}
    />
  </AppStack.Navigator>
);

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsCheckingAuth(false);
    });

    return unsubscribe

  }, []);

  if (isCheckingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral">
        <ActivityIndicator size="large" color="#7BC9FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}