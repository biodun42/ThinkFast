import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { UserAnswer } from "@/types";
import {
  formatTime,
  getScoreMessage,
  getScorePercentage,
  triggerHaptic,
} from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button, Card, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResultsScreen() {
  const router = useRouter();
  const {
    score,
    totalQuestions,
    timeSpent,
    category,
    userAnswers,
    difficulty,
  } = useLocalSearchParams<{
    score: string;
    totalQuestions: string;
    timeSpent: string;
    category: string;
    userAnswers?: string;
    difficulty?: string;
  }>();

  const [detailedResults, setDetailedResults] = useState<UserAnswer[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [hasStoredResult, setHasStoredResult] = useState(false);

  const confettiRef = useRef<ConfettiCannon>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const scoreNum = parseInt(score || "0");
  const totalNum = parseInt(totalQuestions || "10");
  const timeSpentNum = parseFloat(timeSpent || "0");
  const percentage = getScorePercentage(scoreNum, totalNum);
  const message = getScoreMessage(percentage);

  useEffect(() => {
    if (userAnswers) {
      try {
        const parsed = JSON.parse(userAnswers);
        setDetailedResults(parsed);
      } catch (error) {
        console.error("Error parsing user answers:", error);
      }
    }
  }, [userAnswers]);

  useEffect(() => {
    // Store result to leaderboard
    const storeResult = async () => {
      if (!hasStoredResult && scoreNum > 0) {
        try {
          await StorageService.addQuizResult({
            score: scoreNum,
            totalQuestions: totalNum,
            timeSpent: timeSpentNum,
            category: category || "General",
            date: new Date().toISOString(),
            difficulty: difficulty || "medium",
            percentage: percentage,
          });
          setHasStoredResult(true);
        } catch (error) {
          console.error("Error storing quiz result:", error);
        }
      }
    };

    storeResult();

    // Trigger confetti for good scores
    if (percentage >= 70) {
      setTimeout(() => {
        confettiRef.current?.start();
        triggerHaptic("success");
      }, 500);
    }

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    percentage,
    scoreNum,
    totalNum,
    timeSpentNum,
    category,
    difficulty,
    hasStoredResult,
  ]);

  const handlePlayAgainSame = () => {
    triggerHaptic("light");
    router.back();
  };

  const handlePlayAgainCategory = () => {
    triggerHaptic("light");
    router.back();
    router.back();
  };

  const handleRandomQuiz = () => {
    triggerHaptic("light");
    router.replace("/categories");
  };

  const handleMainMenu = () => {
    triggerHaptic("light");
    router.replace("/");
  };

  const handleViewLeaderboard = () => {
    triggerHaptic("light");
    router.push("/leaderboard");
  };

  const getScoreColor = () => {
    if (percentage >= 80) return BrandColors.primary;
    if (percentage >= 60) return BrandColors.accent;
    return BrandColors.highlight;
  };

  const renderDetailedResults = () => {
    if (!detailedResults.length) return null;

    return (
      <Card style={styles.detailsCard}>
        <Card.Content>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Question Review</Text>
            <IconButton
              icon={showDetails ? "chevron-up" : "chevron-down"}
              size={24}
              iconColor={BrandColors.text}
              onPress={() => setShowDetails(!showDetails)}
            />
          </View>

          {showDetails && (
            <View style={styles.detailsContent}>
              {detailedResults.map((result, index) => (
                <View key={index} style={styles.questionResult}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>
                      Question {index + 1}
                    </Text>
                    <Ionicons
                      name={
                        result.isCorrect ? "checkmark-circle" : "close-circle"
                      }
                      size={24}
                      color={
                        result.isCorrect
                          ? BrandColors.primary
                          : BrandColors.highlight
                      }
                    />
                  </View>

                  <Text style={styles.questionText}>{result.question}</Text>

                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <Text
                      style={[
                        styles.answerText,
                        {
                          color: result.isCorrect
                            ? BrandColors.primary
                            : BrandColors.highlight,
                        },
                      ]}
                    >
                      {result.selectedAnswer}
                    </Text>
                  </View>

                  {!result.isCorrect && (
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerLabel}>Correct Answer:</Text>
                      <Text
                        style={[
                          styles.answerText,
                          { color: BrandColors.primary },
                        ]}
                      >
                        {result.correctAnswer}
                      </Text>
                    </View>
                  )}

                  <View style={styles.answerContainer}>
                    <Text style={styles.answerLabel}>Time Taken:</Text>
                    <Text style={styles.answerText}>
                      {formatTime(Math.round(result.timeSpent))}
                    </Text>
                  </View>

                  {index < detailedResults.length - 1 && (
                    <Divider style={styles.questionDivider} />
                  )}
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {percentage >= 70 && (
        <ConfettiCannon
          ref={confettiRef}
          count={100}
          origin={{ x: -10, y: 0 }}
          explosionSpeed={350}
          fadeOut={true}
          autoStart={false}
        />
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.completedText}>Quiz Completed!</Text>
          <Text style={styles.categoryText}>{category}</Text>

          <Card style={styles.scoreCard}>
            <Card.Content style={styles.scoreContent}>
              <Text style={[styles.scoreText, { color: getScoreColor() }]}>
                {scoreNum}/{totalNum}
              </Text>
              <Text style={[styles.percentageText, { color: getScoreColor() }]}>
                {percentage}%
              </Text>
              <Text style={styles.messageText}>{message}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.statsTitle}>Statistics</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Correct Answers:</Text>
                <Text style={styles.statValue}>{scoreNum}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Questions:</Text>
                <Text style={styles.statValue}>{totalNum}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Time Spent:</Text>
                <Text style={styles.statValue}>
                  {formatTime(Math.round(timeSpentNum))}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Average per Question:</Text>
                <Text style={styles.statValue}>
                  {formatTime(Math.round(timeSpentNum / totalNum))}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {renderDetailedResults()}

          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>What's Next?</Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handlePlayAgainSame}
                style={[styles.button, styles.playAgainButton]}
                labelStyle={styles.buttonText}
                contentStyle={styles.buttonContent}
                icon="refresh"
              >
                Try Again
              </Button>

              <Button
                mode="outlined"
                onPress={handlePlayAgainCategory}
                style={[styles.button, styles.mainMenuButton]}
                labelStyle={styles.mainMenuButtonText}
                contentStyle={styles.buttonContent}
                icon="folder-open"
              >
                Same Category
              </Button>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleRandomQuiz}
                style={[styles.button, styles.mainMenuButton]}
                labelStyle={styles.mainMenuButtonText}
                contentStyle={styles.buttonContent}
                icon="dice-multiple"
              >
                Random Quiz
              </Button>

              <Button
                mode="text"
                onPress={handleViewLeaderboard}
                style={styles.button}
                labelStyle={styles.textButtonText}
                contentStyle={styles.buttonContent}
                icon="trophy"
              >
                View Leaderboard
              </Button>
            </View>

            <Button
              mode="text"
              onPress={handleMainMenu}
              style={styles.button}
              labelStyle={styles.textButtonText}
              contentStyle={styles.buttonContent}
              icon="home"
            >
              Main Menu
            </Button>
          </View>
        </Animated.View>
      </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  resultContainer: {
    alignItems: "center",
  },
  completedText: {
    fontSize: 28,
    fontWeight: "bold",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 20,
    marginBottom: 24,
    width: "100%",
    elevation: 4,
  },
  scoreContent: {
    alignItems: "center",
    padding: 32,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  messageText: {
    fontSize: 18,
    color: BrandColors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: BrandColors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
  },
  detailsCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
  },
  detailsContent: {
    paddingTop: 16,
  },
  questionResult: {
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
  },
  questionText: {
    fontSize: 16,
    color: BrandColors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  answerContainer: {
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    marginBottom: 4,
  },
  answerText: {
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.text,
  },
  questionDivider: {
    marginTop: 16,
    backgroundColor: BrandColors.border,
  },
  actionSection: {
    width: "100%",
    marginTop: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  buttonContent: {
    height: 56,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.background,
  },
  playAgainButton: {
    backgroundColor: BrandColors.primary,
  },
  mainMenuButton: {
    borderColor: BrandColors.border,
    borderWidth: 2,
  },
  mainMenuButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.textSecondary,
  },
});
