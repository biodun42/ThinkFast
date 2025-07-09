import { BrandColors } from "@/constants/Colors";
import { StorageService } from "@/services/storage";
import { AppSettings } from "@/types";
import { triggerHaptic } from "@/utils/helpers";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Divider,
  IconButton,
  RadioButton,
  Switch,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: true,
    defaultQuestions: 10,
    defaultTimeLimit: 30,
    soundEnabled: true,
    hapticEnabled: true,
    difficulty: "medium",
    isFirstLaunch: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await StorageService.saveSettings(newSettings);
      triggerHaptic("light");
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "This will clear all saved quiz results. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearLeaderboard();
              triggerHaptic("success");
              Alert.alert("Success", "All quiz results have been cleared.");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Quiz Defaults</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Default Questions</Text>
              <Text style={styles.settingValue}>
                {settings.defaultQuestions}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={30}
              step={1}
              value={settings.defaultQuestions}
              onValueChange={(value) =>
                saveSettings({ defaultQuestions: value })
              }
              minimumTrackTintColor={BrandColors.primary}
              maximumTrackTintColor={BrandColors.border}
              thumbTintColor={BrandColors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>5</Text>
              <Text style={styles.sliderLabel}>30</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Default Time Limit</Text>
              <Text style={styles.settingValue}>
                {settings.defaultTimeLimit === 0
                  ? "No Timer"
                  : `${settings.defaultTimeLimit}s`}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={120}
              step={15}
              value={settings.defaultTimeLimit}
              onValueChange={(value) =>
                saveSettings({ defaultTimeLimit: value })
              }
              minimumTrackTintColor={BrandColors.primary}
              maximumTrackTintColor={BrandColors.border}
              thumbTintColor={BrandColors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>No Timer</Text>
              <Text style={styles.sliderLabel}>120s</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Default Difficulty</Text>
              <Text style={styles.settingValue}>
                {settings.difficulty.charAt(0).toUpperCase() +
                  settings.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  settings.difficulty === "easy" && styles.radioOptionSelected,
                ]}
                onPress={() => saveSettings({ difficulty: "easy" })}
              >
                <View style={styles.radioButton}>
                  <RadioButton
                    value="easy"
                    status={
                      settings.difficulty === "easy" ? "checked" : "unchecked"
                    }
                    color={BrandColors.primary}
                  />
                  <View style={styles.radioContent}>
                    <Text style={styles.radioLabel}>Easy</Text>
                    <Text style={styles.radioDescription}>
                      More time, simpler questions
                    </Text>
                  </View>
                </View>
                <Ionicons name="star" size={20} color={BrandColors.accent} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioOption,
                  settings.difficulty === "medium" &&
                    styles.radioOptionSelected,
                ]}
                onPress={() => saveSettings({ difficulty: "medium" })}
              >
                <View style={styles.radioButton}>
                  <RadioButton
                    value="medium"
                    status={
                      settings.difficulty === "medium" ? "checked" : "unchecked"
                    }
                    color={BrandColors.primary}
                  />
                  <View style={styles.radioContent}>
                    <Text style={styles.radioLabel}>Medium</Text>
                    <Text style={styles.radioDescription}>
                      Balanced difficulty
                    </Text>
                  </View>
                </View>
                <View style={styles.difficultyStars}>
                  <Ionicons name="star" size={20} color={BrandColors.accent} />
                  <Ionicons name="star" size={20} color={BrandColors.accent} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioOption,
                  settings.difficulty === "hard" && styles.radioOptionSelected,
                ]}
                onPress={() => saveSettings({ difficulty: "hard" })}
              >
                <View style={styles.radioButton}>
                  <RadioButton
                    value="hard"
                    status={
                      settings.difficulty === "hard" ? "checked" : "unchecked"
                    }
                    color={BrandColors.primary}
                  />
                  <View style={styles.radioContent}>
                    <Text style={styles.radioLabel}>Hard</Text>
                    <Text style={styles.radioDescription}>
                      Challenging questions
                    </Text>
                  </View>
                </View>
                <View style={styles.difficultyStars}>
                  <Ionicons name="star" size={20} color={BrandColors.accent} />
                  <Ionicons name="star" size={20} color={BrandColors.accent} />
                  <Ionicons name="star" size={20} color={BrandColors.accent} />
                </View>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Data Management</Text>
            <View style={styles.dataButtons}>
              <Button
                mode="outlined"
                onPress={handleClearData}
                style={styles.clearButton}
                labelStyle={styles.clearButtonText}
                contentStyle={styles.buttonContent}
                icon="delete"
              >
                Clear Quiz Results
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push("/leaderboard")}
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                contentStyle={styles.buttonContent}
                icon="trophy"
              >
                View Leaderboard
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>About ThinkFast</Text>
            <Text style={styles.aboutText}>
              ThinkFast is a fast-paced quiz app that challenges your knowledge
              across multiple categories. Test your skills with timed questions,
              use lifelines strategically, and track your progress on the
              leaderboard!
            </Text>
            <View style={styles.aboutDetails}>
              <Text style={styles.aboutLabel}>Version: 1.0.0</Text>
              <Text style={styles.aboutLabel}>
                Questions powered by The Trivia API
              </Text>
              <Text style={styles.aboutLabel}>
                Built with React Native & Expo
              </Text>
            </View>
          </Card.Content>
        </Card>
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: BrandColors.text,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },
  settingValue: {
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: "600",
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
  radioGroup: {
    marginTop: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  radioOptionSelected: {
    backgroundColor: BrandColors.primary + "20",
    borderColor: BrandColors.primary,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioContent: {
    marginLeft: 12,
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: BrandColors.text,
  },
  radioDescription: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  difficultyStars: {
    flexDirection: "row",
    gap: 2,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: BrandColors.border,
  },
  dataButtons: {
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderColor: BrandColors.highlight,
    borderWidth: 2,
  },
  clearButtonText: {
    color: BrandColors.highlight,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    flex: 1,
    borderColor: BrandColors.primary,
    borderWidth: 2,
  },
  actionButtonText: {
    color: BrandColors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContent: {
    height: 48,
  },
  aboutText: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  aboutDetails: {
    gap: 4,
  },
  aboutLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
});
