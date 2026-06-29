import { Stack } from "expo-router";
import {
  Geist_400Regular,
  Geist_600SemiBold,
  useFonts,
} from "@expo-google-fonts/geist";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Geist_400Regular,
    Geist_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      ></Stack>
    </SafeAreaProvider>
  );
}
