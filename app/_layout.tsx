import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";

import { Stack, Redirect, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isOnboardingComplete } from "@/utils/onboardingStorage";


const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};


function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (onOnboarding) return;

    let cancelled = false;
    isOnboardingComplete().then((done) => {
      if (cancelled) return;
      // Only redirect to paywall from onboarding completion — not from tabs
      if (!done) {
        const onPaywall = pathname === "/paywall";
        if (onPaywall) return;
        if (!isSubscribed) {
          router.replace("/paywall");
        }
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [isSubscribed, loading, pathname, router]);

  return null;
}

export default function RootLayout() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PlayfairDisplay_400Regular: require("../assets/fonts/PlayfairDisplay_400Regular.ttf"),
    PlayfairDisplay_700Bold: require("../assets/fonts/PlayfairDisplay_700Bold.ttf"),
    PlayfairDisplay_400Regular_Italic: require("../assets/fonts/PlayfairDisplay_400Regular_Italic.ttf"),
    DMSans_400Regular: require("../assets/fonts/DMSans_400Regular.ttf"),
    DMSans_500Medium: require("../assets/fonts/DMSans_500Medium.ttf"),
    DMSans_700Bold: require("../assets/fonts/DMSans_700Bold.ttf"),
  });

  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      setOnboardingComplete(complete);
    });
  }, [pathname]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (onboardingComplete === null) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "#8B4513",
      background: "#FAF7F4",
      card: "#FFFFFF",
      text: "#1C1410",
      border: "rgba(139,69,19,0.10)",
      notification: "#C0392B",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    dark: true,
    colors: {
      primary: "#D4A853",
      background: "#120D09",
      card: "#1E1610",
      text: "#F5EDE6",
      border: "rgba(255,255,255,0.08)",
      notification: "#C0392B",
    },
  };

  return (
    <SubscriptionProvider>
          <SubscriptionRedirect />
  <DevErrorBoundary>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <SafeAreaProvider>
          <WidgetProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              {onboardingComplete === false && pathname !== "/auth" && pathname !== "/paywall" && pathname !== "/auth-popup" && pathname !== "/auth-callback" && <Redirect href="/onboarding" />}

              <Stack>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="result"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    headerTransparent: false,
                    title: "Wood Analysis",
                  }}
                />
                <Stack.Screen
                  name="privacy"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    title: "Privacy Policy",
                  }}
                />
                <Stack.Screen
                  name="terms"
                  options={{
                    headerShown: true,
                    headerBackButtonDisplayMode: "minimal",
                    title: "Terms of Service",
                  }}
                />
              </Stack>
              <SystemBars style={"auto"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
    </SubscriptionProvider>
  );
}
