import { CategoryIcon } from "@/types";

export const categoryIcons: CategoryIcon = {
  general_knowledge: "🧠",
  arts_and_literature: "🎨",
  film_and_tv: "🎬",
  food_and_drink: "🍕",
  geography: "🌍",
  history: "📜",
  music: "🎵",
  science: "🧪",
  society_and_culture: "🏛️",
  sport_and_leisure: "⚽",
  technology: "💻",
  mathematics: "🔢",
  animals: "🐾",
  vehicles: "🚗",
  entertainment: "🎪",
  nature: "🌲",
  politics: "🏛️",
  religion: "⛪",
  mythology: "🐉",
  philosophy: "🤔",
};

export const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || "❓";
};

export const difficultyColors = {
  easy: "#3FC495",
  medium: "#77ACB7",
  hard: "#F8B097",
};

export const getDifficultyColor = (difficulty: string): string => {
  return (
    difficultyColors[difficulty as keyof typeof difficultyColors] || "#3FC495"
  );
};
