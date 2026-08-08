import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrototypeProvider } from '@/features/prototype/PrototypeContext';
import { AuthProvider } from '@/providers/AuthProvider';
import { RouteGuard } from '@/providers/RouteGuard';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PrototypeProvider>
          <StatusBar style="dark" />
          <RouteGuard><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></RouteGuard>
        </PrototypeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
