import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { triggerHaptic } from "@/utils/helpers";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const TIME_OPTIONS = [
  { label: "No Timer", value: 0 },
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "60 seconds", value: 60 },
  { label: "Custom", value: -1 },
];

export default function QuizConfigScreen() {
  const router = useRouter();
  const { category, categoryDisplayName } = useLocalSearchParams<{
    category: string;
    categoryDisplayName: string;
  }>();

  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const [customTime, setCustomTime] = useState(30);
  const [selectedTimeOption, setSelectedTimeOption] = useState(30);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await StorageService.getSettings();
      setNumberOfQuestions(settings.defaultQuestions);
      setTimeLimit(settings.defaultTimeLimit);
      setSelectedTimeOption(settings.defaultTimeLimit);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleTimeOptionSelect = (value: number) => {
    triggerHaptic("light");
    setSelectedTimeOption(value);

    if (value === -1) {
      setTimeLimit(customTime);
    } else {
      setTimeLimit(value);
    }
  };

  const handleCustomTimeChange = (value: number) => {
    setCustomTime(value);
    if (selectedTimeOption === -1) {
      setTimeLimit(value);
    }
  };

  const handleStartQuiz = () => {
    triggerHaptic("light");

    if (!category || !categoryDisplayName) {
      Alert.alert("Error", "Category information is missing.");
      return;
    }

    router.push({
      pathname: "/quiz" as any,
      params: {
        numberOfQuestions: numberOfQuestions.toString(),
        timeLimit: timeLimit.toString(),
        category,
        categoryDisplayName,
      },
    });
  };

  const handleBack = () => {
    triggerHaptic("light");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={BrandColors.text}
          size={24}
          onPress={handleBack}
        />
        <Text style={styles.headerTitle}>Quiz Setup</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Selected Category</Text>
            <Text style={styles.categoryName}>{categoryDisplayName}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Number of Questions</Text>
            <Text style={styles.sliderValue}>{numberOfQuestions}</Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={30}
              step={1}
              value={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              minimumTrackTintColor={BrandColors.primary}
              maximumTrackTintColor={BrandColors.border}
              thumbTintColor={BrandColors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>5</Text>
              <Text style={styles.sliderLabel}>30</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Timer Mode</Text>
            <View style={styles.timeOptions}>
              {TIME_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  mode={
                    selectedTimeOption === option.value
                      ? "contained"
                      : "outlined"
                  }
                  onPress={() => handleTimeOptionSelect(option.value)}
                  style={[
                    styles.timeOption,
                    selectedTimeOption === option.value &&
                      styles.selectedTimeOption,
                  ]}
                  labelStyle={[
                    styles.timeOptionText,
                    selectedTimeOption === option.value &&
                      styles.selectedTimeOptionText,
                  ]}
                >
                  {option.label}
                </Button>
              ))}
            </View>

            {selectedTimeOption === -1 && (
              <View style={styles.customTimeContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.customTimeLabel}>
                  Custom Time: {customTime}s
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={300}
                  step={5}
                  value={customTime}
                  onValueChange={handleCustomTimeChange}
                  minimumTrackTintColor={BrandColors.primary}
                  maximumTrackTintColor={BrandColors.border}
                  thumbTintColor={BrandColors.primary}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>10s</Text>
                  <Text style={styles.sliderLabel}>300s</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleStartQuiz}
          style={styles.startButton}
          labelStyle={styles.startButtonText}
          contentStyle={styles.startButtonContent}
        >
          Start Quiz
        </Button>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: BrandColors.card,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.text,
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: "500",
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: BrandColors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  slider: {
    height: 40,
    marginBottom: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeOption: {
    borderRadius: 8,
    borderColor: BrandColors.border,
  },
  selectedTimeOption: {
    backgroundColor: BrandColors.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: BrandColors.text,
  },
  selectedTimeOptionText: {
    color: BrandColors.background,
  },
  customTimeContainer: {
    marginTop: 16,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: BrandColors.border,
  },
  customTimeLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: BrandColors.primary,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
  },
  startButtonContent: {
    height: 56,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: BrandColors.background,
  },
});
