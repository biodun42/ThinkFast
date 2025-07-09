import * as Haptics from "expo-haptics";
import { TriviaQuestion } from "../types";

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getScorePercentage = (score: number, total: number): number => {
  return Math.round((score / total) * 100);
};

export const getScoreMessage = (percentage: number): string => {
  if (percentage >= 90) return "Brilliant! 🏆";
  if (percentage >= 80) return "Excellent! 🌟";
  if (percentage >= 70) return "Great job! 🎉";
  if (percentage >= 60) return "Good work! 👍";
  if (percentage >= 50) return "Not bad! 💪";
  return "Keep practicing! 📚";
};

export const prepareQuestion = (
  question: TriviaQuestion
): TriviaQuestion & { allAnswers: string[] } => {
  const allAnswers = shuffleArray([
    question.correctAnswer,
    ...question.incorrectAnswers,
  ]);
  return {
    ...question,
    allAnswers,
  };
};

export const triggerHaptic = (
  type: "success" | "error" | "light" = "light"
) => {
  switch (type) {
    case "success":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
  }
};

export const formatCategoryName = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getRandomCategory = (categories: {
  [key: string]: string[];
}): string => {
  const categoryKeys = Object.keys(categories);
  const randomIndex = Math.floor(Math.random() * categoryKeys.length);
  return categoryKeys[randomIndex];
};
