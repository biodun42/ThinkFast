import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, Provider as PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { BrandColors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: BrandColors.primary,
    background: BrandColors.background,
    card: BrandColors.card,
    text: BrandColors.text,
    border: BrandColors.border,
  },
};

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: BrandColors.primary,
    background: BrandColors.background,
    surface: BrandColors.card,
    onSurface: BrandColors.text,
    onBackground: BrandColors.text,
    outline: BrandColors.border,
    surfaceVariant: BrandColors.card,
    onSurfaceVariant: BrandColors.textSecondary,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={customTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="index" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="quiz-config" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="results" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" backgroundColor={BrandColors.background} />
      </ThemeProvider>
    </PaperProvider>
  );
}
