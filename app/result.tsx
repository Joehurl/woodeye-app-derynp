import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  useColorScheme,
  ImageSourcePropType,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Layers, Palette, Hammer, Home, DollarSign, Leaf, Store } from 'lucide-react-native';
import { COLORS } from '@/constants/WoodColors';
import { WoodResult } from '@/types/wood';
import { Image } from 'expo-image';
import * as Location from 'expo-location';

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
        <Text
          accessibilityRole="text"
          style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: textSecondary, lineHeight: 21 }}
        >
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
  const [isFindingSuppliers, setIsFindingSuppliers] = useState(false);

  let result: WoodResult | null = null;
  try {
    result = JSON.parse(params.data ?? '{}') as WoodResult;
  } catch {
    result = null;
  }

  const bg = isDark ? COLORS.dark.background : COLORS.background;
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

  const handleFindSuppliers = async () => {
    if (!result) return;
    const species = result.species;
    console.log('[WoodEye] Find Nearby Suppliers tapped for species:', species);

    setIsFindingSuppliers(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      console.log('[WoodEye] Location permission status:', status, 'canAskAgain:', canAskAgain);

      if (status !== 'granted') {
        if (!canAskAgain) {
          Alert.alert(
            'Location Permission Required',
            'Location access has been denied. Please enable it in Settings to find suppliers near you.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  console.log('[WoodEye] Opening device settings for location permission');
                  Linking.openSettings();
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Location Access Needed',
            'Location access is needed to find suppliers near you.'
          );
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      console.log('[WoodEye] Opening maps for suppliers:', species, lat, lng);

      let mapsUrl: string;
      if (Platform.OS === 'ios') {
        mapsUrl = `maps://?q=${encodeURIComponent(species + ' lumber yard')}&near=${lat},${lng}`;
      } else if (Platform.OS === 'android') {
        mapsUrl = `geo:${lat},${lng}?q=${encodeURIComponent(species + ' lumber yard near me')}`;
      } else {
        mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(species + ' lumber yard near me')}`;
      }

      await Linking.openURL(mapsUrl);
    } catch (error) {
      console.log('[WoodEye] Error finding suppliers:', error);
      Alert.alert('Error', 'Could not open Maps. Please try again.');
    } finally {
      setIsFindingSuppliers(false);
    }
  };

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
  const heroImageLabel = `Photo of ${result.species} wood`;
  const funFactLabel = `Fun fact: ${result.funFact}`;
  const confidenceBadgeLabel = `Identification confidence: ${confidenceDisplay}`;
  const suppliersAccessibilityLabel = `Find nearby suppliers for ${result.species}`;
  const currentYear = new Date().getFullYear();

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
              accessibilityLabel={heroImageLabel}
              accessibilityRole="image"
            />
            {/* Confidence badge */}
            <View
              style={{
                position: 'absolute', bottom: 16, right: 16,
                backgroundColor: 'rgba(18,13,9,0.75)',
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 20,
              }}
              accessibilityLabel={confidenceBadgeLabel}
            >
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

          {/* Find Nearby Suppliers button */}
          <AnimatedCard index={6}>
            <TouchableOpacity
              onPress={() => {
                console.log('[WoodEye] Find Nearby Suppliers button pressed');
                handleFindSuppliers();
              }}
              disabled={isFindingSuppliers}
              accessibilityRole="button"
              accessibilityLabel={suppliersAccessibilityLabel}
              accessibilityHint="Opens Maps to search for local lumber yards"
              activeOpacity={0.75}
            >
              <View style={{
                backgroundColor: COLORS.primaryMuted,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark ? COLORS.dark.border : COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                opacity: isFindingSuppliers ? 0.7 : 1,
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: COLORS.primary,
                  justifyContent: 'center', alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {isFindingSuppliers
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Store size={22} color="#FFFFFF" />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: 'DMSans_700Bold',
                    fontSize: 15,
                    color: isDark ? COLORS.dark.text : COLORS.text,
                    marginBottom: 2,
                  }}>
                    Find Nearby Suppliers
                  </Text>
                  <Text style={{
                    fontFamily: 'DMSans_400Regular',
                    fontSize: 13,
                    color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary,
                    lineHeight: 18,
                  }}>
                    Locate lumber yards &amp; wood dealers near you
                  </Text>
                </View>
                <MapPin size={18} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </AnimatedCard>

          {/* Fun fact card */}
          <AnimatedCard index={7}>
            <View
              accessibilityLabel={funFactLabel}
              style={{
                backgroundColor: isDark ? 'rgba(212,168,83,0.12)' : COLORS.accentMuted,
                borderRadius: 16, padding: 20,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(212,168,83,0.25)' : 'rgba(212,168,83,0.3)',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: COLORS.accent, marginBottom: 8 }}>
                Did you know?
              </Text>
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: textColor, lineHeight: 22 }}>
                {result.funFact}
              </Text>
            </View>
          </AnimatedCard>

          {/* Disclaimer */}
          <AnimatedCard index={8}>
            <Text style={{
              fontFamily: 'DMSans_400Regular',
              fontSize: 12,
              color: textSecondary,
              textAlign: 'center',
              lineHeight: 18,
              paddingHorizontal: 20,
              paddingBottom: 8,
              opacity: 0.7,
            }}>
              Wood identification is AI-assisted and may not be 100% accurate. Always verify with a professional for critical applications.
            </Text>
          </AnimatedCard>

          <Text style={{
            fontFamily: 'DMSans_400Regular',
            fontSize: 11,
            color: textSecondary,
            textAlign: 'center',
            opacity: 0.4,
            marginBottom: 8,
          }}>
            {currentYear}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
