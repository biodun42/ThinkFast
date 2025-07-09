import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getCategoryIcon } from "@/constants/CategoryIcons";
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
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, IconButton, Searchbar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

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
    Object.entries(categories).forEach(([key, value]) => {
      const categoryName = formatCategoryName(key);
      if (categoryName.toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[key] = value;
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
            <Card.Content style={styles.cardContent}>
              <Text style={styles.categoryIcon}>{icon}</Text>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
              <Text style={styles.subcategoryCount}>
                {subcategories.length} topics
              </Text>
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
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={categoryEntries.length > 1 ? styles.row : undefined}
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
    margin: 8,
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
  },
  cardContent: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subcategoryCount: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    textAlign: "center",
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
