import { useState, useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase/config';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import HomeScreen from '../screens/home/HomeScreen';
import VaccinesScreen from '../screens/vaccines/VaccinesScreen';
import GrowthScreen from '../screens/growth/GrowthScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type AuthStackParamList = {
  Login: undefined,
  Register: undefined,
};

export type AppTabParamList = {
  Home: undefined;
  Vaccines: undefined;
  Growth: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppNavigatorTabs = () => (
  <AppTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Home: focused ? 'home' : 'home-outline',
          Vaccines: focused ? 'medkit' : 'medkit-outline',
          Growth: focused ? 'stats-chart' : 'stats-chart-outline',
          Profile: focused ? 'person' : 'person-outline',
        };

        return (
          <Ionicons
            name={icons[route.name]}
            size={size}
            color={color}
          />
        );
      },

      tabBarActiveTintColor: '#7BC9FF',
      tabBarInactiveTintColor: '#9CA3AF',

      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E5E7EB',
        borderTopWidth: 1,
        paddingBottom: 8,
        paddingTop: 8,
        height: 65,
      },

      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
      },

    }
    )
    }
  >
    <AppTab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarLabel: 'Inicio' }}
    />
    <AppTab.Screen
      name="Vaccines"
      component={VaccinesScreen}
      options={{ tabBarLabel: 'Vacunas' }}
    />
    <AppTab.Screen
      name="Growth"
      component={GrowthScreen}
      options={{ tabBarLabel: 'Crecimiento' }}
    />
    <AppTab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Perfil' }}
    />

  </AppTab.Navigator>

)

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
      {user ? <AppNavigatorTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}