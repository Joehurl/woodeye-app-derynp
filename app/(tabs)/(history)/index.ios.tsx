import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Clock, Info, Crown, Lock } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/WoodColors';
import { getHistory, deleteFromHistory } from '@/utils/historyStorage';
import { HistoryEntry } from '@/types/wood';
import { Image } from 'expo-image';
import { useSubscription } from '@/contexts/SubscriptionContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FREE_HISTORY_LIMIT = 3;

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function AnimatedListItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, [index, opacity, translateY]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

interface UndoToastProps {
  visible: boolean;
  onUndo: () => void;
  isDark: boolean;
}

function UndoToast({ visible, onUndo, isDark }: UndoToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Animated.View style={{
      position: 'absolute', bottom: 120, left: 20, right: 20,
      opacity, transform: [{ translateY }],
      backgroundColor: isDark ? '#2A1F17' : '#1C1410',
      borderRadius: 14, padding: 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: '#F5EDE6' }}>
        Scan removed
      </Text>
      <AnimatedPressable onPress={onUndo}>
        <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: COLORS.accent }}>
          Undo
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

interface ProUpsellBannerProps {
  lockedCount: number;
  isDark: boolean;
  onUpgrade: () => void;
}

function ProUpsellBanner({ lockedCount, isDark, onUpgrade }: ProUpsellBannerProps) {
  return (
    <AnimatedPressable
      onPress={onUpgrade}
      style={{
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: isDark ? '#2A1F17' : '#FFF8F2',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
      }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: COLORS.primaryMuted,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Lock size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 14, color: isDark ? COLORS.dark.text : COLORS.text }}>
            {lockedCount}
            {' '}
            older scan
            {lockedCount !== 1 ? 's' : ''}
            {' '}
            locked
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: isDark ? COLORS.dark.textSecondary : COLORS.textSecondary, marginTop: 2 }}>
            Upgrade to Pro for unlimited history
          </Text>
        </View>
        <View style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
        }}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 12, color: '#FFFFFF' }}>
            Upgrade
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoVisible, setUndoVisible] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<{ entry: HistoryEntry; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isSubscribed } = useSubscription();

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const surface = isDark ? COLORS.dark.surface : COLORS.surface;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const borderColor = isDark ? COLORS.dark.border : COLORS.border;

  const loadHistory = useCallback(async () => {
    console.log('[WoodEye] Loading history');
    const data = await getHistory();
    console.log('[WoodEye] History loaded:', data.length, 'entries, isSubscribed:', isSubscribed);
    setHistory(data);
    setLoading(false);
  }, [isSubscribed]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const visibleHistory = isSubscribed ? history : history.slice(0, FREE_HISTORY_LIMIT);
  const lockedCount = isSubscribed ? 0 : Math.max(0, history.length - FREE_HISTORY_LIMIT);

  const handleDelete = useCallback((entry: HistoryEntry, index: number) => {
    console.log('[WoodEye] Delete history entry tapped:', entry.species, 'id:', entry.id);
    if (undoTimer.current) clearTimeout(undoTimer.current);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistory((prev) => prev.filter((e) => e.id !== entry.id));
    setLastDeleted({ entry, index });
    setUndoVisible(true);

    undoTimer.current = setTimeout(async () => {
      console.log('[WoodEye] Committing delete for id:', entry.id);
      await deleteFromHistory(entry.id);
      setUndoVisible(false);
      setLastDeleted(null);
    }, 4000);
  }, []);

  const handleUndo = useCallback(() => {
    if (!lastDeleted) return;
    console.log('[WoodEye] Undo delete for:', lastDeleted.entry.species);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHistory((prev) => {
      const next = [...prev];
      next.splice(lastDeleted.index, 0, lastDeleted.entry);
      return next;
    });
    setUndoVisible(false);
    setLastDeleted(null);
  }, [lastDeleted]);

  const handleItemPress = useCallback((entry: HistoryEntry) => {
    console.log('[WoodEye] History item tapped:', entry.species, 'id:', entry.id);
    router.push({
      pathname: '/result',
      params: { data: JSON.stringify(entry) },
    });
  }, []);

  const handlePrivacyPress = useCallback(() => {
    console.log('[WoodEye] Privacy button tapped');
    router.push('/privacy');
  }, []);

  const handleProPress = useCallback(() => {
    console.log('[WoodEye] Pro button tapped — opening paywall');
    router.push('/paywall');
  }, []);

  const handleUpgradeBannerPress = useCallback(() => {
    console.log('[WoodEye] Upgrade banner tapped — opening paywall, lockedCount:', lockedCount);
    router.push('/paywall');
  }, [lockedCount]);

  const confidenceText = (c: number) => `${Math.round(c)}% match`;

  const renderItem = ({ item, index }: { item: HistoryEntry; index: number }) => {
    const dateText = formatDate(item.scannedAt);
    const confText = confidenceText(item.confidence);
    const confColor = item.confidence >= 80 ? COLORS.success : item.confidence >= 60 ? COLORS.accent : COLORS.textSecondary;
    const itemAccessibilityLabel = `${item.species}, scanned ${dateText}, ${Math.round(item.confidence)}% confidence`;

    return (
      <AnimatedListItem index={index}>
        <AnimatedPressable
          onPress={() => handleItemPress(item)}
          accessibilityLabel={itemAccessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Opens detailed wood analysis"
          style={{
            flexDirection: 'row',
            backgroundColor: surface,
            borderRadius: 16,
            marginHorizontal: 20,
            marginBottom: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Thumbnail */}
          <View style={{ width: 88, height: 88 }}>
            <Image
              source={resolveImageSource(item.imageUri)}
              style={{ width: 88, height: 88 }}
              contentFit="cover"
            />
          </View>

          {/* Info */}
          <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
            <View>
              <Text
                style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: textColor, letterSpacing: -0.2 }}
                numberOfLines={1}
              >
                {item.species}
              </Text>
              <Text
                style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: textSecondary, fontStyle: 'italic', marginTop: 2 }}
                numberOfLines={1}
              >
                {item.scientificName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Clock size={12} color={textSecondary} />
                <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: textSecondary }}>
                  {dateText}
                </Text>
              </View>
              <View style={{
                backgroundColor: isDark ? 'rgba(212,168,83,0.15)' : COLORS.accentMuted,
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 6,
              }}>
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, color: confColor }}>
                  {confText}
                </Text>
              </View>
            </View>
          </View>

          {/* Delete button */}
          <AnimatedPressable
            onPress={() => handleDelete(item, index)}
            style={{
              width: 44, justifyContent: 'center', alignItems: 'center',
              borderLeftWidth: 1, borderLeftColor: borderColor,
            }}
            accessibilityLabel={`Delete ${item.species} scan`}
            accessibilityRole="button"
          >
            <Trash2 size={18} color={COLORS.danger} />
          </AnimatedPressable>
        </AnimatedPressable>
      </AnimatedListItem>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: bg }}>
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: 16,
          flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <View>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: textColor, letterSpacing: -0.5 }}>
              History
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: textSecondary, marginTop: 2 }}>
              Your past wood identifications
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            {!isSubscribed && (
              <TouchableOpacity
                onPress={handleProPress}
                accessibilityLabel="Upgrade to Pro"
                accessibilityRole="button"
                accessibilityHint="Opens the Pro subscription paywall"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Crown size={13} color="#FFFFFF" />
                <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#FFFFFF' }}>
                  Pro
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handlePrivacyPress}
              accessibilityLabel="Privacy policy"
              accessibilityRole="button"
              accessibilityHint="Opens the privacy policy"
              style={{ padding: 4 }}
            >
              <Info size={20} color={textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{
                height: 88, borderRadius: 16,
                backgroundColor: surface,
                borderWidth: 1, borderColor,
              }} />
            ))}
          </View>
        ) : history.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 24,
              backgroundColor: COLORS.primaryMuted,
              justifyContent: 'center', alignItems: 'center', marginBottom: 20,
            }}>
              <Clock size={36} color={COLORS.primary} />
            </View>
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 20, color: textColor, marginBottom: 8, textAlign: 'center' }}>
              No scans yet
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: textSecondary, textAlign: 'center', lineHeight: 22 }}>
              Tap the camera to identify your first wood sample
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleHistory}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListFooterComponent={
              lockedCount > 0
                ? <ProUpsellBanner lockedCount={lockedCount} isDark={isDark} onUpgrade={handleUpgradeBannerPress} />
                : null
            }
            contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 120 }}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
          />
        )}

        <UndoToast visible={undoVisible} onUndo={handleUndo} isDark={isDark} />
      </View>
    </>
  );
}
