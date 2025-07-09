import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { BrandColors } from "../constants/Colors";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  type?: "spinner" | "pulse" | "timer";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "large",
  type = "spinner",
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (type === "spinner" || type === "timer") {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else if (type === "pulse") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type]);

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getIcon = () => {
    switch (type) {
      case "timer":
        return "time-outline";
      case "pulse":
        return "help-circle-outline";
      default:
        return "refresh-outline";
    }
  };

  const getIconSize = () => {
    return size === "large" ? 40 : 24;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { rotate: type === "pulse" ? "0deg" : rotation },
              { scale: type === "pulse" ? pulseValue : 1 },
            ],
          },
        ]}
      >
        <Ionicons
          name={getIcon()}
          size={getIconSize()}
          color={BrandColors.primary}
        />
      </Animated.View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BrandColors.background,
  },
  iconContainer: {
    marginBottom: 16,
  },
  text: {
    color: BrandColors.text,
    fontSize: 16,
    textAlign: "center",
  },
});
