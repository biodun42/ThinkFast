import { BrandColors } from "@/constants/Colors";
import { Lifeline } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface LifelineButtonProps {
  lifeline: Lifeline;
  onPress: () => void;
  disabled?: boolean;
}

export const LifelineButton: React.FC<LifelineButtonProps> = ({
  lifeline,
  onPress,
  disabled = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled || lifeline.used) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getIconName = () => {
    switch (lifeline.id) {
      case "fifty_fifty":
        return "options-outline";
      case "skip":
        return "play-skip-forward-outline";
      case "extra_time":
        return "time-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          lifeline.used && styles.usedButton,
          disabled && styles.disabledButton,
        ]}
        onPress={handlePress}
        disabled={disabled || lifeline.used}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getIconName()}
          size={24}
          color={
            lifeline.used ? BrandColors.textSecondary : BrandColors.primary
          }
        />
        <Text style={[styles.text, lifeline.used && styles.usedText]}>
          {lifeline.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface LifelinesContainerProps {
  lifelines: Lifeline[];
  onLifelinePress: (lifeline: Lifeline) => void;
  disabled?: boolean;
}

export const LifelinesContainer: React.FC<LifelinesContainerProps> = ({
  lifelines,
  onLifelinePress,
  disabled = false,
}) => {
  return (
    <View style={styles.lifelinesContainer}>
      {lifelines.map((lifeline) => (
        <LifelineButton
          key={lifeline.id}
          lifeline={lifeline}
          onPress={() => onLifelinePress(lifeline)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lifelinesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    borderWidth: 2,
    borderColor: BrandColors.border,
  },
  usedButton: {
    backgroundColor: BrandColors.background,
    borderColor: BrandColors.textSecondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    color: BrandColors.text,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  usedText: {
    color: BrandColors.textSecondary,
  },
});
