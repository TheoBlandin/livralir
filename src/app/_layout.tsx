import { Stack } from "expo-router";
import {
  Geist_400Regular,
  Geist_600SemiBold,
  useFonts,
} from "@expo-google-fonts/geist";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

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
    <Stack
      screenOptions={{
        headerShown: false, 
      }}
    ></Stack>
  );
}
