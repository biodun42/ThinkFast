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

// Real image URLs for categories
export const categoryImages: { [key: string]: string } = {
  "Arts & Literature":
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
  "Film & TV":
    "https://images.unsplash.com/photo-1697465379722-98040bb9c509?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Food & Drink":
    "https://plus.unsplash.com/premium_photo-1672938878598-31c1c614f708?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fEZvb2QlMjAlMjYlMjBEcmlua3xlbnwwfHwwfHx8MA%3D%3D",
  "General Knowledge":
    "https://images.unsplash.com/photo-1593061231114-1798846fd643?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8R2VuZXJhbCUyMEtub3dsZWRnZXxlbnwwfHwwfHx8MA%3D%3D",
  Geography:
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop",
  History:
    "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop",
  Music:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  Science:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
  "Society & Culture":
    "https://images.unsplash.com/photo-1541960071727-c531398e7494?w=400&h=300&fit=crop",
  "Sport & Leisure":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
};

export const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || "❓";
};

export const getCategoryImage = (category: string): string => {
  return (
    categoryImages[category] ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
  );
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
