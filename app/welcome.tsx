import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { triggerHaptic } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous icon rotation
    Animated.loop(
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleGetStarted = async () => {
    triggerHaptic("light");

    // Mark first launch as complete
    await StorageService.saveSettings({ isFirstLaunch: false });

    router.replace("/" as any);
  };

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: iconRotation }],
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={80}
              color={BrandColors.primary}
            />
          </Animated.View>

          <Text style={styles.title}>ThinkFast</Text>
          <Text style={styles.tagline}>Learn Fast. Think Faster.</Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={20} color={BrandColors.accent} />
              <Text style={styles.featureText}>Lightning-fast quizzes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={20} color={BrandColors.accent} />
              <Text style={styles.featureText}>Track your progress</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="library" size={20} color={BrandColors.accent} />
              <Text style={styles.featureText}>Multiple categories</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 32,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BrandColors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    elevation: 4,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: BrandColors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: BrandColors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    fontStyle: "italic",
  },
  features: {
    gap: 16,
    alignItems: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: BrandColors.text,
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  getStartedButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
  },
  buttonContent: {
    height: 56,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.background,
  },
});
