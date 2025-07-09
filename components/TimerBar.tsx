import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { BrandColors } from "../constants/Colors";

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalTime }) => {
  const progress = (timeLeft / totalTime) * 100;
  const animatedWidth = React.useRef(new Animated.Value(100)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getBarColor = () => {
    if (progress > 60) return BrandColors.primary;
    if (progress > 30) return BrandColors.accent;
    return BrandColors.highlight;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timeText}>{timeLeft}s</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: getBarColor(),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    color: BrandColors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: BrandColors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
});
