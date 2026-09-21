import React from 'react';
import { ScrollView, View, Text, Pressable, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/WoodColors';

const SECTIONS = [
  {
    heading: 'Overview',
    body: 'WoodEye is a wood identification app. We are committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.',
  },
  {
    heading: 'Information We Do Not Collect',
    body: 'We do not collect your name, email address, phone number, location data (location is used only on-device to open Maps and is never transmitted to us), payment information, or any other personally identifiable information. No account or registration is required.',
  },
  {
    heading: 'Camera & Photo Access',
    body: 'When you take a photo or select one from your gallery, the image is sent to an AI service solely to identify the wood species. The image is not stored on our servers, not linked to any identity, and not used for any purpose other than returning the identification result.',
  },
  {
    heading: 'Scan History',
    body: 'Your scan history is stored locally on your device using AsyncStorage. It never leaves your device and is not synced to any server or cloud service.',
  },
  {
    heading: 'Location Data',
    body: 'If you tap "Find Nearby Suppliers", the app requests your device location solely to open your native Maps app with a pre-filled search. Your coordinates are never transmitted to WoodEye or any third party.',
  },
  {
    heading: 'Third-Party Services',
    body: 'The AI identification feature uses an AI inference service. Images sent for identification are processed transiently and not retained. We do not use advertising networks, analytics SDKs, or any other third-party tracking services.',
  },
  {
    heading: "Children's Privacy",
    body: 'WoodEye does not knowingly collect any information from children under 13. The app contains no features directed at children.',
  },
  {
    heading: 'Data Retention',
    body: 'We do not retain any user data on our servers because we do not collect any. Scan history stored on your device can be deleted at any time by clearing the app\'s data or uninstalling the app.',
  },
  {
    heading: 'Your Rights',
    body: 'Since we collect no personal data, there is nothing to access, correct, or delete on our end. You can delete your local scan history from within the app at any time.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'We may update this policy from time to time. Continued use of the app after changes constitutes acceptance of the updated policy.',
  },
  {
    heading: 'Contact',
    body: 'If you have questions about this privacy policy, contact Joseph Hurley at joehurl36@gmail.com.',
  },
];

export default function PrivacyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const dividerColor = isDark ? COLORS.dark.divider : COLORS.divider;

  const currentYear = new Date().getFullYear();

  function handleTermsPress() {
    console.log('[Privacy] User pressed "View Terms of Service" link');
    router.push('/terms');
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy', headerBackButtonDisplayMode: 'minimal' }} />
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
          Privacy Policy
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

        {/* Terms of Service link */}
        <View style={{ marginTop: 32, alignItems: 'center' }}>
          <Pressable
            onPress={handleTermsPress}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 14,
              color: COLORS.primary,
              lineHeight: 22,
            }}>
              View Terms of Service →
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={{
          fontFamily: 'DMSans_400Regular',
          fontSize: 12,
          color: textSecondary,
          textAlign: 'center',
          lineHeight: 18,
          marginTop: 24,
          opacity: 0.7,
        }}>
          Last updated: {currentYear}
        </Text>
      </ScrollView>
    </>
  );
}
