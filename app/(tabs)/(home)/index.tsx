import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  Platform,
  Linking,
  useColorScheme,
  ImageSourcePropType,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, AlertCircle, Settings } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/WoodColors';
import { saveToHistory } from '@/utils/historyStorage';
import { WoodResult } from '@/types/wood';
import { identifyWood } from '@/utils/woodApi';
import { Image } from 'expo-image';

function resolveImageSource(source: string | number | ImageSourcePropType | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  if (typeof source === 'string') return { uri: source };
  return source as ImageSourcePropType;
}

function SkeletonPulse({ width, height, borderRadius = 8 }: { width: number | string; height: number; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.View
      style={{
        width: width as number,
        height,
        borderRadius,
        backgroundColor: 'rgba(139,69,19,0.15)',
        opacity,
      }}
    />
  );
}

export default function IdentifyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const scanBorderOpacity = useRef(new Animated.Value(0.4)).current;
  const scanBorderAnim = useRef<Animated.CompositeAnimation | null>(null);

  const bg = isDark ? COLORS.dark.background : COLORS.background;
  const textColor = isDark ? COLORS.dark.text : COLORS.text;
  const textSecondary = isDark ? COLORS.dark.textSecondary : COLORS.textSecondary;
  const borderColor = isDark ? COLORS.dark.border : COLORS.border;

  useEffect(() => {
    if (isAnalyzing) {
      scanBorderAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanBorderOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(scanBorderOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      );
      scanBorderAnim.current.start();
    } else {
      scanBorderAnim.current?.stop();
      scanBorderOpacity.setValue(0.4);
    }
  }, [isAnalyzing, scanBorderOpacity]);

  const analyzeImage = useCallback(async (base64: string, localUri: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    console.log('[WoodEye] Starting wood analysis, image URI:', localUri);

    try {
      const result: WoodResult = await identifyWood(base64);
      console.log('[WoodEye] Analysis complete:', result.species, 'confidence:', result.confidence);

      const entry = await saveToHistory({ ...result, imageUri: localUri });
      console.log('[WoodEye] Navigating to result screen, id:', entry.id);

      router.push({
        pathname: '/result',
        params: { data: JSON.stringify({ ...result, imageUri: localUri }) },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[WoodEye] Analysis failed:', msg);
      setErrorMsg(`Couldn't analyze the wood. ${msg}`);
    } finally {
      setIsAnalyzing(false);
      setCapturedUri(null);
    }
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isAnalyzing) return;
    console.log('[WoodEye] Capture button pressed');
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64 || !photo.uri) {
        console.warn('[WoodEye] No photo data returned');
        return;
      }
      setCapturedUri(photo.uri);
      await analyzeImage(photo.base64, photo.uri);
    } catch (err) {
      console.error('[WoodEye] Camera capture error:', err);
      setErrorMsg('Failed to capture photo. Please try again.');
    }
  }, [isAnalyzing, analyzeImage]);

  const handleGallery = useCallback(async () => {
    console.log('[WoodEye] Gallery button pressed');
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[WoodEye] Gallery permission denied, canAskAgain:', canAskAgain);
      if (!canAskAgain) {
        console.log('[WoodEye] Gallery permission permanently denied — opening Settings');
        Linking.openSettings();
      } else {
        setErrorMsg('Photo library access is needed to select wood photos.');
      }
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) {
      console.log('[WoodEye] Gallery picker cancelled');
      return;
    }
    const asset = result.assets[0];
    if (!asset.base64) {
      setErrorMsg('Could not read image data. Please try another photo.');
      return;
    }
    console.log('[WoodEye] Gallery image selected:', asset.uri);
    setCapturedUri(asset.uri);
    await analyzeImage(asset.base64, asset.uri);
  }, [analyzeImage]);

  const handlePermissionAction = useCallback(() => {
    if (permission?.canAskAgain) {
      console.log('[WoodEye] Requesting camera permission');
      requestPermission();
    } else {
      console.log('[WoodEye] Camera permission permanently denied — opening Settings');
      Linking.openSettings();
    }
  }, [permission, requestPermission]);

  const permissionButtonLabel = permission?.canAskAgain ? 'Allow camera access' : 'Open Settings';

  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }}>
        <SkeletonPulse width={200} height={20} />
      </View>
    );
  }

  if (!permission.granted && permission.canAskAgain) {
    // Pre-permission rationale screen
    return (
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top + 20, paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: textColor, marginBottom: 8, letterSpacing: -0.5 }}>
          WoodEye
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: textSecondary, marginBottom: 48 }}>
          Identify any wood species
        </Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: COLORS.primaryMuted,
            justifyContent: 'center', alignItems: 'center', marginBottom: 24,
          }}>
            <Camera size={36} color={COLORS.primary} />
          </View>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 22, color: textColor, marginBottom: 12, textAlign: 'center' }}>
            Identify wood with your camera
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: textSecondary, textAlign: 'center', lineHeight: 23, maxWidth: 300, marginBottom: 36 }}>
            WoodEye uses your camera to photograph wood samples. Point at any wood surface and we'll identify the species, grain, hardness, and more.
          </Text>
          <AnimatedPressable
            onPress={handlePermissionAction}
            accessibilityLabel="Allow camera access"
            accessibilityRole="button"
            accessibilityHint="Requests permission to use your camera"
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 40, paddingVertical: 16,
              borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
            }}
          >
            <Camera size={18} color="#FFF" />
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#FFF' }}>
              Continue
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  if (!permission.granted && !permission.canAskAgain) {
    // Permanently denied — show Settings link
    return (
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top + 20, paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: textColor, marginBottom: 8, letterSpacing: -0.5 }}>
          WoodEye
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: textSecondary, marginBottom: 48 }}>
          Identify any wood species
        </Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: COLORS.primaryMuted,
            justifyContent: 'center', alignItems: 'center', marginBottom: 24,
          }}>
            <AlertCircle size={36} color={COLORS.primary} />
          </View>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 20, color: textColor, marginBottom: 8, textAlign: 'center' }}>
            Camera access needed
          </Text>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280, marginBottom: 32 }}>
            WoodEye needs camera access to photograph and identify wood species. Please enable it in Settings.
          </Text>
          <AnimatedPressable
            onPress={handlePermissionAction}
            accessibilityLabel="Open Settings to enable camera access"
            accessibilityRole="button"
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 32, paddingVertical: 16,
              borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
            }}
          >
            <Settings size={18} color="#FFF" />
            <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#FFF' }}>
              {permissionButtonLabel}
            </Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const cornerColor = isAnalyzing ? COLORS.accent : COLORS.primary;
  const cornerSize = 28;
  const cornerThickness = 3;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: 16 }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: textColor, letterSpacing: -0.5 }}>
          WoodEye
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: textSecondary, marginTop: 2 }}>
          Identify any wood species
        </Text>
      </View>

      {/* Camera Viewfinder */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={{
          flex: 1,
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          borderWidth: 1,
          borderColor,
        }}>
          {capturedUri && isAnalyzing ? (
            <Image
              source={resolveImageSource(capturedUri)}
              style={{ flex: 1 }}
              contentFit="cover"
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
            />
          )}

          {/* Corner brackets */}
          <Animated.View style={{ position: 'absolute', inset: 0, opacity: isAnalyzing ? scanBorderOpacity : 1 }}>
            {/* Top-left */}
            <View style={{ position: 'absolute', top: 20, left: 20 }}>
              <View style={{ width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderRadius: 2 }} />
              <View style={{ width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderRadius: 2, marginTop: -cornerThickness }} />
            </View>
            {/* Top-right */}
            <View style={{ position: 'absolute', top: 20, right: 20, alignItems: 'flex-end' }}>
              <View style={{ width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderRadius: 2 }} />
              <View style={{ width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderRadius: 2, marginTop: -cornerThickness }} />
            </View>
            {/* Bottom-left */}
            <View style={{ position: 'absolute', bottom: 20, left: 20, justifyContent: 'flex-end' }}>
              <View style={{ width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderRadius: 2 }} />
              <View style={{ width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderRadius: 2, marginTop: -cornerThickness }} />
            </View>
            {/* Bottom-right */}
            <View style={{ position: 'absolute', bottom: 20, right: 20, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <View style={{ width: cornerThickness, height: cornerSize, backgroundColor: cornerColor, borderRadius: 2 }} />
              <View style={{ width: cornerSize, height: cornerThickness, backgroundColor: cornerColor, borderRadius: 2, marginTop: -cornerThickness }} />
            </View>
          </Animated.View>

          {/* Analyzing overlay */}
          {isAnalyzing && (
            <View style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(18,13,9,0.55)',
              justifyContent: 'center', alignItems: 'center',
              gap: 16,
            }}>
              <View style={{ gap: 10, alignItems: 'center' }}>
                <SkeletonPulse width={160} height={14} borderRadius={7} />
                <SkeletonPulse width={120} height={14} borderRadius={7} />
                <SkeletonPulse width={140} height={14} borderRadius={7} />
              </View>
              <Text
                style={{ fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#F5EDE6', marginTop: 8 }}
                accessibilityLiveRegion="polite"
              >
                Analyzing wood...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Error toast */}
      {errorMsg && (
        <View style={{
          marginHorizontal: 20, marginBottom: 8,
          backgroundColor: isDark ? '#2A1010' : '#FEF2F2',
          borderRadius: 12, padding: 14,
          borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)',
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <AlertCircle size={18} color={COLORS.danger} />
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 14, color: COLORS.danger, flex: 1, lineHeight: 20 }}>
            {errorMsg}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={{
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}>
        {/* Gallery button */}
        <AnimatedPressable
          onPress={handleGallery}
          disabled={isAnalyzing}
          style={{
            width: 52, height: 52, borderRadius: 16,
            backgroundColor: isDark ? COLORS.dark.surfaceSecondary : COLORS.surfaceSecondary,
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor,
          }}
          accessibilityLabel="Choose photo from library"
          accessibilityRole="button"
          accessibilityHint="Opens your photo library to select a wood photo"
        >
          <ImageIcon size={22} color={isDark ? COLORS.dark.textSecondary : COLORS.textSecondary} />
        </AnimatedPressable>

        {/* Capture button */}
        <AnimatedPressable
          onPress={handleCapture}
          disabled={isAnalyzing}
          scaleValue={0.94}
          style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: COLORS.primary,
            justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 4px 20px rgba(139,69,19,0.4)',
          }}
          accessibilityLabel="Take photo to identify wood"
          accessibilityRole="button"
          accessibilityHint="Takes a photo and analyzes the wood species"
        >
          <Camera size={32} color="#FFF" />
        </AnimatedPressable>

        {/* Spacer to balance layout */}
        <View style={{ width: 52, height: 52 }} />
      </View>
    </View>
  );
}
