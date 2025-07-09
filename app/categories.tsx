import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getCategoryIcon, getCategoryImage } from "@/constants/CategoryIcons";
import { BrandColors } from "@/constants/Colors";
import { TriviaAPI } from "@/services/triviaAPI";
import { Category } from "@/types";
import { formatCategoryName, triggerHaptic } from "@/utils/helpers";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Chip, IconButton, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width - 32; // Single column with padding

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchQuery, categories]);

  const fetchCategories = async () => {
    try {
      const data = await TriviaAPI.getCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered: Category = {};
    const queryLower = searchQuery.toLowerCase();

    Object.entries(categories).forEach(([key, subcategories]) => {
      const categoryName = formatCategoryName(key);

      // Check if category name matches
      const categoryMatches = categoryName.toLowerCase().includes(queryLower);

      // Check if any subcategory matches
      const subcategoryMatches = subcategories.some(
        (subcat) =>
          subcat.toLowerCase().includes(queryLower) ||
          subcat.replace(/_/g, " ").toLowerCase().includes(queryLower)
      );

      // Include category if either category name or any subcategory matches
      if (categoryMatches || subcategoryMatches) {
        filtered[key] = subcategories;
      }
    });

    setFilteredCategories(filtered);
  };

  const handleCategorySelect = (categoryKey: string, categoryName: string) => {
    triggerHaptic("light");
    router.push({
      pathname: "/quiz-config" as any,
      params: {
        category: categoryKey,
        categoryDisplayName: categoryName,
      },
    });
  };

  const handleBack = () => {
    triggerHaptic("light");
    router.back();
  };

  const renderCategoryItem = ({
    item,
    index,
  }: {
    item: [string, string[]];
    index: number;
  }) => {
    const [categoryKey, subcategories] = item;
    const categoryName = formatCategoryName(categoryKey);
    const icon = getCategoryIcon(categoryKey);
    const imageUrl = getCategoryImage(categoryName);

    const scaleAnim = new Animated.Value(1);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        handleCategorySelect(categoryKey, categoryName);
      }, 150);
    };

    const formatTopicName = (topic: string) => {
      return topic
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    return (
      <Animated.View
        style={[styles.categoryItem, { transform: [{ scale: scaleAnim }] }]}
      >
        <TouchableOpacity
          style={styles.categoryTouchable}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <Card style={styles.categoryCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.categoryImage}
                defaultSource={require("@/assets/images/icon.png")}
              />
              <View style={styles.imageOverlay}>
                <Text style={styles.categoryIcon}>{icon}</Text>
              </View>
            </View>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
              <Text style={styles.subcategoryCount}>
                {subcategories.length} topics
              </Text>
              <View style={styles.topicsContainer}>
                {subcategories.slice(0, 4).map((topic, idx) => (
                  <Chip
                    key={idx}
                    style={styles.topicChip}
                    textStyle={styles.topicChipText}
                    mode="outlined"
                    compact
                  >
                    {formatTopicName(topic)}
                  </Chip>
                ))}
                {subcategories.length > 4 && (
                  <Chip
                    style={[styles.topicChip, styles.moreChip]}
                    textStyle={styles.moreChipText}
                    mode="outlined"
                    compact
                  >
                    +{subcategories.length - 4}
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading categories..." type="pulse" />;
  }

  const categoryEntries = Object.entries(filteredCategories);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={BrandColors.text}
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Choose Category</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={BrandColors.primary}
        />
      </View>

      <FlatList
        data={categoryEntries}
        renderItem={renderCategoryItem}
        keyExtractor={([key]) => key}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    color: BrandColors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  row: {
    justifyContent: "space-between",
  },
  categoryItem: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    alignSelf: "center",
  },
  categoryTouchable: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 16,
    elevation: 3,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 250,
  },
  cardContent: {
    padding: 16,
    alignItems: "flex-start",
    minHeight: 120,
    justifyContent: "flex-start",
  },
  imageContainer: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 6,
  },
  categoryIcon: {
    fontSize: 20,
    color: "white",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 4,
  },
  subcategoryCount: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 8,
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  topicChip: {
    backgroundColor: BrandColors.background,
    borderColor: BrandColors.border,
    borderWidth: 1,
    height: 24,
    marginRight: 4,
    marginBottom: 4,
  },
  topicChipText: {
    fontSize: 10,
    color: BrandColors.textSecondary,
    lineHeight: 12,
  },
  moreChip: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  moreChipText: {
    fontSize: 10,
    color: BrandColors.background,
    lineHeight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    textAlign: "center",
  },
});
