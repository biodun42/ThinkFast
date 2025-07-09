export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  type: string;
  difficulty: string;
  tags: string[];
}

export interface PreparedTriviaQuestion extends TriviaQuestion {
  allAnswers: string[];
}

export interface QuizSettings {
  numberOfQuestions: number;
  timeLimit: number; // 0 means no time limit
  category: string;
  categoryDisplayName: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  category: string;
  date: string;
  percentage: number;
  difficulty?: string;
}

export interface AppSettings {
  darkMode: boolean;
  defaultQuestions: number;
  defaultTimeLimit: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  difficulty: "easy" | "medium" | "hard";
  isFirstLaunch: boolean;
}

export interface Category {
  [key: string]: string[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  question: string;
  correctAnswer: string;
}

export interface Lifeline {
  id: "fifty_fifty" | "skip" | "extra_time";
  name: string;
  icon: string;
  used: boolean;
  description: string;
}

export interface DailyChallenge {
  date: string;
  questions: TriviaQuestion[];
  completed: boolean;
  score?: number;
}

export interface CategoryIcon {
  [key: string]: string;
}
