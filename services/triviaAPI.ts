import axios from "axios";
import { Category, TriviaQuestion } from "../types";

const BASE_URL = "https://the-trivia-api.com/api";

export class TriviaAPI {
  static async getCategories(): Promise<Category> {
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async getQuestions(
    limit: number = 10,
    category?: string,
    difficulty?: string
  ): Promise<TriviaQuestion[]> {
    try {
      let url = `${BASE_URL}/questions?limit=${limit}`;

      if (category && category !== "random") {
        url += `&categories=${category}`;
      }

      if (difficulty) {
        url += `&difficulty=${difficulty}`;
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw new Error("Failed to fetch questions");
    }
  }

  static async getRandomQuestions(
    limit: number = 10
  ): Promise<TriviaQuestion[]> {
    return this.getQuestions(limit);
  }

  static async searchQuestions(
    query: string,
    limit: number = 10,
    difficulty?: string
  ): Promise<TriviaQuestion[]> {
    try {
      // First try to find matching category
      const categories = await this.getCategories();
      const queryLower = query.toLowerCase();

      let matchedCategory = null;

      // Search through categories and subcategories
      for (const [categoryName, subcategories] of Object.entries(categories)) {
        // Check if category name matches
        if (categoryName.toLowerCase().includes(queryLower)) {
          matchedCategory = categoryName;
          break;
        }

        // Check if any subcategory matches
        const matchingSubcategory = subcategories.find(
          (subcat: string) =>
            subcat.toLowerCase().includes(queryLower) ||
            subcat.replace(/_/g, " ").toLowerCase().includes(queryLower)
        );

        if (matchingSubcategory) {
          matchedCategory = matchingSubcategory;
          break;
        }
      }

      if (matchedCategory) {
        // Get questions from the matched category
        return await this.getQuestions(limit, matchedCategory, difficulty);
      } else {
        // If no category matches, return random questions
        console.warn("No matching category found, returning random questions");
        return await this.getRandomQuestions(limit);
      }
    } catch (error) {
      console.error("Error searching questions:", error);
      // Fallback to random questions
      try {
        return await this.getRandomQuestions(limit);
      } catch (fallbackError) {
        console.error("Fallback search failed:", fallbackError);
        throw new Error("Failed to search questions");
      }
    }
  }

  static async getDailyChallenge(): Promise<TriviaQuestion[]> {
    try {
      const response = await axios.get(
        `${BASE_URL}/questions?limit=10&difficulty=medium`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
      throw new Error("Failed to fetch daily challenge");
    }
  }
}
