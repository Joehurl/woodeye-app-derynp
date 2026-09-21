import React from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import { TabBarItem } from '@/components/FloatingTabBar';
import { useSubscriptionGuard } from "@/hooks/useSubscriptionGuard";

const TABS: TabBarItem[] = [
  {
    name: '(home)',
    route: '/(tabs)/(home)',
    icon: 'camera-alt',
    label: 'Identify',
  },
  {
    name: '(history)',
    route: '/(tabs)/(history)',
    icon: 'history',
    label: 'History',
  },
];

export default function TabLayout() {
  useSubscriptionGuard();

  const pathname = usePathname();
  const isResultScreen = pathname.includes('/result');

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(history)" />
      </Stack>
      {!isResultScreen && <FloatingTabBar tabs={TABS} />}
    </View>
  );
}
