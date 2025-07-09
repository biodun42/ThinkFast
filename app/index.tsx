import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { TriviaAPI } from "@/services/triviaAPI";
import { getRandomCategory, triggerHaptic } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Animated, StyleSheet, View } from "react-native";
import { Button, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MainMenuScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isCheckingFirstLaunch, setIsCheckingFirstLaunch] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    checkFirstLaunch();
    loadDailyChallenge();
  }, []);

  useEffect(() => {
    if (!isCheckingFirstLaunch) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCheckingFirstLaunch]);

  const checkFirstLaunch = async () => {
    try {
      const settings = await StorageService.getSettings();
      if (settings.isFirstLaunch) {
        router.replace("/welcome" as any);
        return;
      }
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error checking first launch:", error);
    } finally {
      setIsCheckingFirstLaunch(false);
    }
  };

  const loadDailyChallenge = async () => {
    try {
      const challenge = await StorageService.getDailyChallenge();
      setDailyChallenge(challenge);
    } catch (error) {
      console.error("Error loading daily challenge:", error);
    }
  };

  const handleStartQuiz = () => {
    triggerHaptic("light");
    router.push("/categories" as any);
  };

  const handleRandomQuiz = async () => {
    setIsLoading(true);
    triggerHaptic("light");

    try {
      const categories = await TriviaAPI.getCategories();
      const randomCategory = getRandomCategory(categories);
      const settings = await StorageService.getSettings();

      router.push({
        pathname: "/quiz" as any,
        params: {
          numberOfQuestions: "10",
          timeLimit: "30",
          category: randomCategory,
          categoryDisplayName: randomCategory.replace(/_/g, " "),
          difficulty: settings.difficulty,
          isRandom: "true",
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to start random quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDailyChallenge = async () => {
    setIsLoading(true);
    triggerHaptic("light");

    try {
      let challenge = await StorageService.getDailyChallenge();

      if (!challenge) {
        // Create new daily challenge
        const questions = await TriviaAPI.getDailyChallenge();
        challenge = {
          date: new Date().toDateString(),
          questions,
          completed: false,
        };
        await StorageService.saveDailyChallenge(challenge);
      }

      router.push({
        pathname: "/quiz" as any,
        params: {
          numberOfQuestions: "10",
          timeLimit: "20",
          category: "daily_challenge",
          categoryDisplayName: "Daily Challenge",
          difficulty: "medium",
          isDaily: "true",
        },
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load daily challenge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      triggerHaptic("light");
      router.push({
        pathname: "/quiz" as any,
        params: {
          numberOfQuestions: "10",
          timeLimit: "30",
          category: "search",
          categoryDisplayName: `Search: ${searchQuery}`,
          searchQuery: searchQuery.trim(),
          difficulty: "medium",
        },
      });
    }
  };

  const handleSettings = () => {
    triggerHaptic("light");
    router.push("/settings" as any);
  };

  const handleLeaderboard = () => {
    triggerHaptic("light");
    router.push("/leaderboard" as any);
  };

  if (isCheckingFirstLaunch) {
    return <LoadingSpinner message="Initializing..." type="timer" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>ThinkFast</Text>
          <Text style={styles.subtitle}>
            Test your knowledge at lightning speed!
          </Text>

          <Searchbar
            placeholder="Search for a topic..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={BrandColors.primary}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleStartQuiz}
            style={[styles.button, styles.primaryButton]}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
            icon={() => (
              <Ionicons name="play" size={20} color={BrandColors.background} />
            )}
          >
            Start Quiz
          </Button>

          <Button
            mode="contained"
            onPress={handleDailyChallenge}
            style={[styles.button, styles.challengeButton]}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
            icon={() => (
              <Ionicons
                name="calendar"
                size={20}
                color={BrandColors.background}
              />
            )}
          >
            🗓️ Daily Challenge
          </Button>

          <Button
            mode="contained"
            onPress={handleRandomQuiz}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.button, styles.randomButton]}
            labelStyle={styles.buttonText}
            contentStyle={styles.buttonContent}
            icon={() => (
              <Ionicons
                name="shuffle"
                size={20}
                color={BrandColors.background}
              />
            )}
          >
            Random Quiz
          </Button>

          <View style={styles.secondaryButtons}>
            <Button
              mode="outlined"
              onPress={handleLeaderboard}
              style={[styles.button, styles.secondaryButton]}
              labelStyle={styles.secondaryButtonText}
              contentStyle={styles.secondaryButtonContent}
              icon={() => (
                <Ionicons name="trophy" size={18} color={BrandColors.text} />
              )}
            >
              Leaderboard
            </Button>

            <Button
              mode="outlined"
              onPress={handleSettings}
              style={[styles.button, styles.secondaryButton]}
              labelStyle={styles.secondaryButtonText}
              contentStyle={styles.secondaryButtonContent}
              icon={() => (
                <Ionicons name="settings" size={18} color={BrandColors.text} />
              )}
            >
              Settings
            </Button>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v1.0.0</Text>
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
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: BrandColors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: BrandColors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: {
    color: BrandColors.text,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
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
  primaryButton: {
    backgroundColor: BrandColors.primary,
  },
  challengeButton: {
    backgroundColor: BrandColors.accent,
  },
  randomButton: {
    backgroundColor: BrandColors.accent,
  },
  secondaryButtons: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderColor: BrandColors.border,
    borderWidth: 2,
  },
  secondaryButtonContent: {
    height: 48,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
  },
  settingsButton: {
    borderColor: BrandColors.border,
    borderWidth: 2,
  },
  settingsButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
  },
});
