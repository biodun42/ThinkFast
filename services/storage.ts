import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppSettings,
  DailyChallenge,
  QuizResult,
  TriviaQuestion,
} from "../types";

const KEYS = {
  SETTINGS: "thinkfast_settings",
  LEADERBOARD: "thinkfast_leaderboard",
  DAILY_CHALLENGE: "thinkfast_daily_challenge",
  OFFLINE_QUESTIONS: "thinkfast_offline_questions",
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  defaultQuestions: 10,
  defaultTimeLimit: 30,
  soundEnabled: true,
  hapticEnabled: true,
  difficulty: "medium",
  isFirstLaunch: true,
};

export class StorageService {
  static async getSettings(): Promise<AppSettings> {
    try {
      const settings = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (settings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(settings) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error getting settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        KEYS.SETTINGS,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  static async getLeaderboard(): Promise<QuizResult[]> {
    try {
      const leaderboard = await AsyncStorage.getItem(KEYS.LEADERBOARD);
      if (leaderboard) {
        return JSON.parse(leaderboard);
      }
      return [];
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  }

  static async addQuizResult(result: QuizResult): Promise<void> {
    try {
      const leaderboard = await this.getLeaderboard();
      leaderboard.push(result);

      // Keep only top 10 results, sorted by score percentage
      leaderboard.sort(
        (a, b) => b.score / b.totalQuestions - a.score / a.totalQuestions
      );
      const top10 = leaderboard.slice(0, 10);

      await AsyncStorage.setItem(KEYS.LEADERBOARD, JSON.stringify(top10));
    } catch (error) {
      console.error("Error adding quiz result:", error);
    }
  }

  static async clearLeaderboard(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.LEADERBOARD);
    } catch (error) {
      console.error("Error clearing leaderboard:", error);
    }
  }

  static async getDailyChallenge(): Promise<DailyChallenge | null> {
    try {
      const challenge = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE);
      if (challenge) {
        const parsed = JSON.parse(challenge);
        const today = new Date().toDateString();

        // Return challenge if it's from today, otherwise null
        if (parsed.date === today) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting daily challenge:", error);
      return null;
    }
  }

  static async saveDailyChallenge(challenge: DailyChallenge): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.DAILY_CHALLENGE,
        JSON.stringify(challenge)
      );
    } catch (error) {
      console.error("Error saving daily challenge:", error);
    }
  }

  static async saveOfflineQuestions(
    questions: TriviaQuestion[]
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        KEYS.OFFLINE_QUESTIONS,
        JSON.stringify(questions)
      );
    } catch (error) {
      console.error("Error saving offline questions:", error);
    }
  }

  static async getOfflineQuestions(): Promise<TriviaQuestion[]> {
    try {
      const questions = await AsyncStorage.getItem(KEYS.OFFLINE_QUESTIONS);
      if (questions) {
        return JSON.parse(questions);
      }
      return [];
    } catch (error) {
      console.error("Error getting offline questions:", error);
      return [];
    }
  }

  static async completeDailyChallenge(score: number): Promise<void> {
    try {
      const challenge = await this.getDailyChallenge();
      if (challenge) {
        challenge.completed = true;
        challenge.score = score;
        await this.saveDailyChallenge(challenge);
      }
    } catch (error) {
      console.error("Error completing daily challenge:", error);
    }
  }
}
