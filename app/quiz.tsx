import { AnswerButton } from "@/components/AnswerButton";
import { LifelinesContainer } from "@/components/Lifelines";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TimerBar } from "@/components/TimerBar";
import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { TriviaAPI } from "@/services/triviaAPI";
import {
  Lifeline,
  PreparedTriviaQuestion,
  TriviaQuestion,
  UserAnswer,
} from "@/types";
import {
  getScorePercentage,
  prepareQuestion,
  triggerHaptic,
} from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Card,
  IconButton,
  ProgressBar,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const initialLifelines: Lifeline[] = [
  {
    id: "fifty_fifty",
    name: "50/50",
    icon: "options-outline",
    used: false,
    description: "Remove 2 incorrect answers",
  },
  {
    id: "skip",
    name: "Skip",
    icon: "play-skip-forward-outline",
    used: false,
    description: "Skip this question",
  },
  {
    id: "extra_time",
    name: "+15s",
    icon: "time-outline",
    used: false,
    description: "Add 15 seconds",
  },
];

export default function QuizScreen() {
  const router = useRouter();
  const {
    numberOfQuestions,
    timeLimit,
    category,
    categoryDisplayName,
    difficulty,
    searchQuery,
  } = useLocalSearchParams<{
    numberOfQuestions: string;
    timeLimit: string;
    category: string;
    categoryDisplayName: string;
    difficulty?: string;
    searchQuery?: string;
  }>();

  const [questions, setQuestions] = useState<PreparedTriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lifelines, setLifelines] = useState<Lifeline[]>(initialLifelines);
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalQuestions = parseInt(numberOfQuestions || "10");
  const timeLimitNum = parseInt(timeLimit || "30");
  const hasTimer = timeLimitNum > 0;

  useEffect(() => {
    fetchQuestions();

    // Handle back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (hasTimer && !isLoading && !isAnswerSubmitted && !isPaused) {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, isLoading, isAnswerSubmitted, isPaused]);

  const fetchQuestions = async () => {
    try {
      let data: TriviaQuestion[];

      if (searchQuery) {
        data = await TriviaAPI.searchQuestions(
          searchQuery,
          totalQuestions,
          difficulty
        );

        // If search returned very few results, show a warning
        if (data.length < totalQuestions) {
          Alert.alert(
            "Search Results",
            `Found ${data.length} questions for "${searchQuery}". ${
              data.length < totalQuestions
                ? "Some random questions were added."
                : ""
            }`,
            [{ text: "OK" }]
          );
        }
      } else {
        data = await TriviaAPI.getQuestions(
          totalQuestions,
          category,
          difficulty
        );
      }

      // Prepare questions with shuffled answers once
      const preparedQuestions = data.map((question) =>
        prepareQuestion(question)
      );
      setQuestions(preparedQuestions);
      setQuestionStartTime(Date.now());
      if (hasTimer) {
        setTimeLeft(timeLimitNum);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load questions. Please try again.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    setTimeLeft(timeLimitNum);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    timerRef.current = timer;
  };

  const handleTimeUp = () => {
    if (isAnswerSubmitted) return;

    triggerHaptic("error");

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const answer: UserAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selectedAnswer: "",
      isCorrect: false,
      timeSpent,
      question: questions[currentQuestionIndex].question,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
    };

    setUserAnswers([...userAnswers, answer]);
    setIsAnswerSubmitted(true);

    setTimeout(() => {
      moveToNextQuestion();
    }, 1000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerSubmitted) return;

    setSelectedAnswer(answer);
    setIsAnswerSubmitted(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    triggerHaptic(isCorrect ? "success" : "error");

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      timeSpent,
      question: currentQuestion.question,
      correctAnswer: currentQuestion.correctAnswer,
    };

    setUserAnswers([...userAnswers, userAnswer]);

    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setHiddenAnswers([]);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const score = userAnswers.filter((answer) => answer.isCorrect).length;
    const totalTime = userAnswers.reduce(
      (sum, answer) => sum + answer.timeSpent,
      0
    );
    const percentage = getScorePercentage(score, totalQuestions);

    // Save result
    StorageService.addQuizResult({
      score,
      totalQuestions,
      timeSpent: totalTime,
      category: categoryDisplayName || "Unknown",
      date: new Date().toISOString(),
      percentage,
      difficulty,
    });

    router.replace({
      pathname: "/results" as any,
      params: {
        score: score.toString(),
        totalQuestions: totalQuestions.toString(),
        timeSpent: totalTime.toString(),
        category: categoryDisplayName,
        userAnswers: JSON.stringify(userAnswers),
      },
    });
  };

  const handleLifelinePress = (lifeline: Lifeline) => {
    if (lifeline.used || isAnswerSubmitted) return;

    triggerHaptic("light");

    const updatedLifelines = lifelines.map((l) =>
      l.id === lifeline.id ? { ...l, used: true } : l
    );
    setLifelines(updatedLifelines);

    const currentQuestion = questions[currentQuestionIndex];

    switch (lifeline.id) {
      case "fifty_fifty":
        // Remove 2 incorrect answers
        const incorrectAnswers = currentQuestion.allAnswers.filter(
          (answer) => answer !== currentQuestion.correctAnswer
        );
        const toHide = incorrectAnswers.slice(0, 2);
        setHiddenAnswers(toHide);
        break;

      case "skip":
        // Skip question
        const userAnswer: UserAnswer = {
          questionId: currentQuestion.id,
          selectedAnswer: "SKIPPED",
          isCorrect: false,
          timeSpent: (Date.now() - questionStartTime) / 1000,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.correctAnswer,
        };
        setUserAnswers([...userAnswers, userAnswer]);
        setIsAnswerSubmitted(true);

        setTimeout(() => {
          moveToNextQuestion();
        }, 500);
        break;

      case "extra_time":
        // Add 15 seconds
        if (hasTimer) {
          setTimeLeft((prev) => prev + 15);
        }
        break;
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleBackPress = () => {
    Alert.alert(
      "Exit Quiz",
      "Are you sure you want to exit? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", style: "destructive", onPress: () => router.back() },
      ]
    );
    return true;
  };

  const handleBack = () => {
    handleBackPress();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading questions..." type="timer" />;
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No questions available for this category.
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / totalQuestions;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          iconColor={BrandColors.text}
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </Text>
        {hasTimer && (
          <IconButton
            icon={isPaused ? "play" : "pause"}
            iconColor={BrandColors.text}
            size={24}
            onPress={isPaused ? handleResume : handlePause}
          />
        )}
      </View>

      <ProgressBar
        progress={progress}
        color={BrandColors.primary}
        style={styles.progressBar}
      />

      <View style={styles.content}>
        <LifelinesContainer
          lifelines={lifelines}
          onLifelinePress={handleLifelinePress}
          disabled={isAnswerSubmitted}
        />

        {hasTimer && !isPaused && (
          <TimerBar timeLeft={timeLeft} totalTime={timeLimitNum} />
        )}

        <Card style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.category}>{categoryDisplayName}</Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </Card.Content>
        </Card>

        <View style={styles.answersContainer}>
          {currentQuestion.allAnswers.map((answer, index) => {
            if (hiddenAnswers.includes(answer)) {
              return (
                <View key={index} style={styles.hiddenAnswer}>
                  <Text style={styles.hiddenAnswerText}>Answer removed</Text>
                </View>
              );
            }

            return (
              <AnswerButton
                key={index}
                answer={answer}
                onPress={() => handleAnswerSelect(answer)}
                isSelected={selectedAnswer === answer}
                isCorrect={
                  isAnswerSubmitted && answer === currentQuestion.correctAnswer
                }
                isIncorrect={
                  isAnswerSubmitted &&
                  selectedAnswer === answer &&
                  answer !== currentQuestion.correctAnswer
                }
                disabled={isAnswerSubmitted}
              />
            );
          })}
        </View>
      </View>

      {/* Pause Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.pauseOverlay}>
          <Card style={styles.pauseCard}>
            <Card.Content style={styles.pauseContent}>
              <Ionicons name="pause" size={48} color={BrandColors.primary} />
              <Text style={styles.pauseTitle}>Quiz Paused</Text>
              <Text style={styles.pauseSubtitle}>
                Take your time. Press resume when ready.
              </Text>
              <Button
                mode="contained"
                onPress={handleResume}
                style={styles.resumeButton}
                labelStyle={styles.resumeButtonText}
              >
                Resume Quiz
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
  },
  progressBar: {
    height: 4,
    backgroundColor: BrandColors.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: BrandColors.card,
    marginBottom: 24,
    borderRadius: 12,
  },
  category: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: BrandColors.text,
    lineHeight: 26,
    fontWeight: "500",
  },
  answersContainer: {
    flex: 1,
  },
  hiddenAnswer: {
    backgroundColor: BrandColors.background,
    borderWidth: 2,
    borderColor: BrandColors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  hiddenAnswerText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
  },
  pauseOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 16,
    margin: 32,
    width: width - 64,
  },
  pauseContent: {
    alignItems: "center",
    padding: 32,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: BrandColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  pauseSubtitle: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  resumeButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 24,
  },
});
