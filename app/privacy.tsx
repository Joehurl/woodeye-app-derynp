import React from 'react';
import { ScrollView, View, Text, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Database, Wifi, Smartphone } from 'lucide-react-native';
import { COLORS } from '@/constants/WoodColors';

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const surface = isDark ? COLORS.dark.surface : COLORS.surface;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const borderColor = isDark ? COLORS.dark.border : COLORS.border;

  const currentYear = new Date().getFullYear();

  const items = [
    {
      icon: <Smartphone size={20} color={COLORS.primary} />,
      title: 'Stored on your device only',
      body: 'Your scan history is saved locally on your device using AsyncStorage. It is never uploaded to any server.',
    },
    {
      icon: <Wifi size={20} color={COLORS.primary} />,
      title: 'AI identification',
      body: 'When you identify wood, the photo is sent to an AI service for analysis. No personal information is attached. Photos are not retained by the AI service after processing.',
    },
    {
      icon: <Database size={20} color={COLORS.primary} />,
      title: 'No personal data collected',
      body: 'WoodEye does not collect your name, email, location, or any other personal information. No account is required.',
    },
    {
      icon: <Shield size={20} color={COLORS.primary} />,
      title: 'No third-party tracking',
      body: 'WoodEye does not use analytics SDKs, advertising networks, or any third-party tracking libraries.',
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy', headerBackButtonDisplayMode: 'minimal' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 26, color: textColor, letterSpacing: -0.3, marginBottom: 8,
        }}>
          Privacy Policy
        </Text>
        <Text style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 14, color: textSecondary, lineHeight: 21, marginBottom: 28,
        }}>
          WoodEye is designed with your privacy in mind. Here is exactly what we do and don't do with your data.
        </Text>

        {items.map((item, i) => (
          <View key={i} style={{
            backgroundColor: surface,
            borderRadius: 16, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor,
            flexDirection: 'row', gap: 14,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: COLORS.primaryMuted,
              justifyContent: 'center', alignItems: 'center',
              flexShrink: 0,
            }}>
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: textColor, marginBottom: 4 }}>
                {item.title}
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: textSecondary, lineHeight: 21 }}>
                {item.body}
              </Text>
            </View>
          </View>
        ))}

        <Text style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 12, color: textSecondary, textAlign: 'center',
          lineHeight: 18, marginTop: 16, opacity: 0.7,
        }}>
          Last updated: {currentYear}
        </Text>
      </ScrollView>
    </>
  );
}
