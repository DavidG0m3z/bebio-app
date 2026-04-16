import { View, Text } from 'react-native';

export default function VaccinesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral">
      <Text className="text-4xl mb-2">💉</Text>
      <Text className="text-text-primary text-lg font-bold">Vacunas</Text>
      <Text className="text-text-secondary text-sm">En construcción</Text>
    </View>
  );
}