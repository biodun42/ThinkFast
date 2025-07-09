import { LoadingSpinner } from "@/components/LoadingSpinner";
import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { QuizResult } from "@/types";
import { getScorePercentage, triggerHaptic } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeaderboardScreen() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const leaderboard = await StorageService.getLeaderboard();
      setResults(leaderboard);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      Alert.alert("Error", "Failed to load leaderboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLeaderboard = () => {
    Alert.alert(
      "Clear Leaderboard",
      "Are you sure you want to clear all scores? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearLeaderboard();
              setResults([]);
              triggerHaptic("success");
            } catch (error) {
              Alert.alert("Error", "Failed to clear leaderboard.");
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    triggerHaptic("light");
    router.back();
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🏆";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return BrandColors.primary;
    if (percentage >= 60) return BrandColors.accent;
    return BrandColors.highlight;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading leaderboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={BrandColors.text}
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <IconButton
          icon="trash-can-outline"
          iconColor={BrandColors.highlight}
          size={24}
          onPress={handleClearLeaderboard}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {results.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons
                name="trophy-outline"
                size={64}
                color={BrandColors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Scores Yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete some quizzes to see your scores here!
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push("/" as any)}
                style={styles.playButton}
                labelStyle={styles.playButtonText}
                contentStyle={styles.playButtonContent}
              >
                Start Playing
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.resultsList}>
            {results.map((result, index) => {
              const percentage = getScorePercentage(
                result.score,
                result.totalQuestions
              );
              return (
                <Card key={index} style={styles.resultCard}>
                  <Card.Content style={styles.resultContent}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.position}>
                        {getPositionIcon(index)}
                      </Text>
                      <View style={styles.scoreContainer}>
                        <Text
                          style={[
                            styles.score,
                            { color: getScoreColor(percentage) },
                          ]}
                        >
                          {result.score}/{result.totalQuestions}
                        </Text>
                        <Text
                          style={[
                            styles.percentage,
                            { color: getScoreColor(percentage) },
                          ]}
                        >
                          {percentage}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.resultDetails}>
                      <Text style={styles.category}>{result.category}</Text>
                      <Text style={styles.date}>{formatDate(result.date)}</Text>
                    </View>

                    {result.difficulty && (
                      <View style={styles.difficultyContainer}>
                        <Text style={styles.difficulty}>
                          {result.difficulty.charAt(0).toUpperCase() +
                            result.difficulty.slice(1)}
                        </Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: BrandColors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyContent: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: BrandColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  playButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
  },
  playButtonContent: {
    height: 48,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.background,
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    elevation: 2,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  position: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  score: {
    fontSize: 20,
    fontWeight: "bold",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultDetails: {
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  difficultyContainer: {
    alignSelf: "flex-start",
  },
  difficulty: {
    fontSize: 12,
    color: BrandColors.accent,
    textTransform: "uppercase",
    fontWeight: "500",
  },
});
