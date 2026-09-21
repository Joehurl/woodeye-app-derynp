import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  useColorScheme,
  ImageSourcePropType,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Layers, Palette, Hammer, Home, DollarSign, Leaf } from 'lucide-react-native';
import { COLORS } from '@/constants/WoodColors';
import { WoodResult } from '@/types/wood';
import { Image } from 'expo-image';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function AnimatedCard({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: 200 + index * 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: 200 + index * 80, useNativeDriver: true }),
    ]).start();
  }, [index, opacity, translateY]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  index: number;
  isDark: boolean;
}

function InfoCard({ icon, title, content, index, isDark }: InfoCardProps) {
  const surface = isDark ? COLORS.dark.surface : COLORS.surface;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const borderColor = isDark ? COLORS.dark.border : COLORS.border;

  return (
    <AnimatedCard index={index}>
      <View style={{
        backgroundColor: surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: COLORS.primaryMuted,
            justifyContent: 'center', alignItems: 'center',
          }}>
            {icon}
          </View>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: textColor }}>
            {title}
          </Text>
        </View>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: textSecondary, lineHeight: 21 }}>
          {content}
        </Text>
      </View>
    </AnimatedCard>
  );
}

export default function ResultScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ data: string }>();

  let result: WoodResult | null = null;
  try {
    result = JSON.parse(params.data ?? '{}') as WoodResult;
  } catch {
    result = null;
  }

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const surface = isDark ? COLORS.dark.surface : COLORS.surface;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const borderColor = isDark ? COLORS.dark.border : COLORS.border;

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (result) {
      console.log('[WoodEye] Result screen loaded:', result.species, 'confidence:', result.confidence);
    }
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroOpacity, headerSlide]);

  if (!result || !result.species) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: textSecondary }}>
          No result data found.
        </Text>
      </View>
    );
  }

  const confidenceNum = Number(result.confidence);
  const confidenceDisplay = `${Math.round(confidenceNum)}% match`;
  const hardnessDisplay = `${Number(result.hardness).toLocaleString()} lbf`;
  const bestUsesDisplay = Array.isArray(result.bestUses) ? result.bestUses.join(', ') : String(result.bestUses ?? '');

  return (
    <>
      <Stack.Screen
        options={{
          title: result.species,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero Image */}
        <Animated.View style={{ opacity: heroOpacity }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={resolveImageSource(result.imageUri)}
              style={{ width: '100%', height: 260 }}
              contentFit="cover"
            />
            {/* Confidence badge */}
            <View style={{
              position: 'absolute', bottom: 16, right: 16,
              backgroundColor: 'rgba(18,13,9,0.75)',
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#F5EDE6' }}>
                {confidenceDisplay}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Species header */}
        <Animated.View style={{
          paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
          opacity: heroOpacity,
          transform: [{ translateY: headerSlide }],
        }}>
          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 30, color: textColor, letterSpacing: -0.5, marginBottom: 4,
          }}>
            {result.species}
          </Text>
          <Text style={{
            fontFamily: 'PlayfairDisplay_400Regular_Italic',
            fontSize: 17, color: textSecondary, marginBottom: 12,
          }}>
            {result.scientificName}
          </Text>

          {/* Origin chip */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: COLORS.primaryMuted,
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 20,
            }}>
              <MapPin size={13} color={COLORS.primary} />
              <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 13, color: COLORS.primary }}>
                {result.origin}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: borderColor, marginHorizontal: 20, marginBottom: 16 }} />

        {/* Info cards */}
        <View style={{ paddingHorizontal: 20 }}>
          <InfoCard
            index={0}
            isDark={isDark}
            icon={<Layers size={18} color={COLORS.primary} />}
            title="Grain & Texture"
            content={`${result.grain}\n\n${result.texture}`}
          />
          <InfoCard
            index={1}
            isDark={isDark}
            icon={<Palette size={18} color={COLORS.primary} />}
            title="Color & Appearance"
            content={result.color}
          />
          <InfoCard
            index={2}
            isDark={isDark}
            icon={<Hammer size={18} color={COLORS.primary} />}
            title="Working Properties"
            content={`Janka hardness: ${hardnessDisplay}\n\n${result.workability}\n\n${result.finishing}`}
          />
          <InfoCard
            index={3}
            isDark={isDark}
            icon={<Home size={18} color={COLORS.primary} />}
            title="Best Uses"
            content={bestUsesDisplay}
          />
          <InfoCard
            index={4}
            isDark={isDark}
            icon={<DollarSign size={18} color={COLORS.primary} />}
            title="Cost & Availability"
            content={`${result.costPerBoardFoot} per board foot\n\n${result.availability}`}
          />
          <InfoCard
            index={5}
            isDark={isDark}
            icon={<Leaf size={18} color={COLORS.success} />}
            title="Sustainability"
            content={result.sustainability}
          />

          {/* Fun fact card */}
          <AnimatedCard index={6}>
            <View style={{
              backgroundColor: isDark ? 'rgba(212,168,83,0.12)' : COLORS.accentMuted,
              borderRadius: 16, padding: 20,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(212,168,83,0.25)' : 'rgba(212,168,83,0.3)',
              marginBottom: 12,
            }}>
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: COLORS.accent, marginBottom: 8 }}>
                Did you know?
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: textColor, lineHeight: 22 }}>
                {result.funFact}
              </Text>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>
    </>
  );
}
