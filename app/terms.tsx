import React from 'react';
import { ScrollView, View, Text, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/WoodColors';

const SECTIONS = [
  {
    heading: 'Acceptance of Terms',
    body: 'By downloading or using WoodEye, you agree to these Terms of Service. If you do not agree, do not use the app.',
  },
  {
    heading: 'Description of Service',
    body: 'WoodEye is a mobile application that uses artificial intelligence to identify wood species from photographs. Results are provided for informational purposes only.',
  },
  {
    heading: 'Disclaimer of Accuracy',
    body: 'AI-based wood identification is not infallible. WoodEye makes no warranty that identification results are accurate, complete, or suitable for any particular purpose. Do not rely solely on WoodEye results for structural, safety, or commercial decisions. Always verify with a qualified professional when accuracy is critical.',
  },
  {
    heading: 'Acceptable Use',
    body: 'You agree to use WoodEye only for lawful purposes. You may not use the app to process images you do not have the right to use, attempt to reverse-engineer or tamper with the app, or use the app in any way that violates applicable laws or regulations.',
  },
  {
    heading: 'Intellectual Property',
    body: 'All content, design, and code within WoodEye is the property of WoodEye and protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works without express written permission.',
  },
  {
    heading: 'Third-Party Services',
    body: 'WoodEye uses third-party AI services to process images. Your use of WoodEye is also subject to the terms of those services. We are not responsible for the availability or accuracy of third-party services.',
  },
  {
    heading: 'Limitation of Liability',
    body: 'To the fullest extent permitted by law, WoodEye and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the app, including but not limited to reliance on identification results.',
  },
  {
    heading: 'Indemnification',
    body: 'You agree to indemnify and hold harmless WoodEye and its developers from any claims, damages, or expenses arising from your use of the app or violation of these terms.',
  },
  {
    heading: 'Termination',
    body: 'We reserve the right to discontinue the app or any feature at any time without notice.',
  },
  {
    heading: 'Governing Law',
    body: 'These terms are governed by the laws of the jurisdiction in which WoodEye operates, without regard to conflict of law principles.',
  },
  {
    heading: 'Changes to Terms',
    body: 'We may update these terms at any time. Continued use of the app after changes constitutes acceptance of the updated terms.',
  },
  {
    heading: 'Contact',
    body: 'Questions about these terms? Contact us at legal@woodeye.app.',
  },
];

export default function TermsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const dividerColor = isDark ? COLORS.dark.divider : COLORS.divider;

  const currentYear = new Date().getFullYear();

  return (
    <>
      <Stack.Screen options={{ title: 'Terms of Service', headerBackButtonDisplayMode: 'minimal' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: insets.bottom + 48 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <Text style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 28,
          color: textColor,
          letterSpacing: -0.4,
          marginBottom: 6,
        }}>
          Terms of Service
        </Text>
        <Text style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 14,
          color: textSecondary,
          lineHeight: 22,
          marginBottom: 32,
        }}>
          Effective date: {currentYear}
        </Text>

        {/* Sections */}
        {SECTIONS.map((section, index) => {
          const isLast = index === SECTIONS.length - 1;
          return (
            <View key={section.heading} style={{ marginBottom: isLast ? 0 : 20 }}>
              <Text style={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 15,
                color: textColor,
                marginBottom: 6,
              }}>
                {section.heading}
              </Text>
              <Text style={{
                fontFamily: 'DMSans_400Regular',
                fontSize: 14,
                color: textSecondary,
                lineHeight: 22,
              }}>
                {section.body}
              </Text>
              {!isLast && (
                <View style={{
                  height: 1,
                  backgroundColor: dividerColor,
                  marginTop: 20,
                }} />
              )}
            </View>
          );
        })}

        {/* Footer */}
        <Text style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: textSecondary,
          textAlign: 'center',
          lineHeight: 18,
          marginTop: 32,
          opacity: 0.7,
        }}>
          Last updated: {currentYear}
        </Text>
      </ScrollView>
    </>
  );
}
