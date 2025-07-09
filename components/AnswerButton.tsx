import React from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { BrandColors } from "../constants/Colors";

interface AnswerButtonProps {
  answer: string;
  onPress: () => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  answer,
  onPress,
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  disabled = false,
}) => {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const getButtonStyle = () => {
    if (isCorrect) {
      return [styles.button, styles.correctButton];
    }
    if (isIncorrect) {
      return [styles.button, styles.incorrectButton];
    }
    if (isSelected) {
      return [styles.button, styles.selectedButton];
    }
    return [styles.button];
  };

  const getTextColor = () => {
    if (isCorrect || isIncorrect || isSelected) {
      return BrandColors.background;
    }
    return BrandColors.text;
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), disabled && styles.disabledButton]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.text, { color: getTextColor() }]}
          numberOfLines={3}
        >
          {answer}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: BrandColors.card,
    borderWidth: 2,
    borderColor: BrandColors.border,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: BrandColors.accent,
    borderColor: BrandColors.accent,
  },
  correctButton: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  incorrectButton: {
    backgroundColor: BrandColors.highlight,
    borderColor: BrandColors.highlight,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
});
