import { useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../theme/tokens.js";

const { color, radius } = tokens;

const HOLD_MS = 1500;
const FADE_MS = 320;

export function SplashScreen({ onFinish }) {
  const reduceMotion = useReducedMotion();
  const fade = useSharedValue(1);
  const pulse = useSharedValue(0);
  const pulseLate = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(1, {
      duration: HOLD_MS,
      easing: Easing.inOut(Easing.quad),
    });
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    pulseLate.value = withDelay(
      700,
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
  }, [progress, pulse, pulseLate, reduceMotion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fade.value = withTiming(0, { duration: FADE_MS }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [fade, onFinish]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + pulse.value * 0.65 }],
    opacity: 0.4 * (1 - pulse.value),
  }));
  const ringLateStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + pulseLate.value * 0.65 }],
    opacity: 0.4 * (1 - pulseLate.value),
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {}}
    >
      <Animated.View
        style={[styles.root, overlayStyle]}
        accessible
        accessibilityLabel="LiveTemp sedang dimuat"
      >
        <View style={styles.center}>
          <View style={styles.badgeStage}>
            <Animated.View style={[styles.ring, ringStyle]} />
            <Animated.View style={[styles.ring, ringLateStyle]} />
            <Animated.View
              entering={FadeInDown.duration(420)}
              style={styles.logo}
            >
              <Ionicons name="thermometer" size={40} color={color.onPrimary} />
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeInDown.delay(80).duration(420)}
            style={styles.title}
          >
            LiveTemp
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(150).duration(420)}
            style={styles.subtitle}
          >
            Real-time temperature monitor
          </Animated.Text>

          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, progressStyle]} />
          </View>
        </View>

        <Text style={styles.footer}>Kelompok 21 · PPB Modul 6</Text>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.text,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    gap: 6,
  },
  badgeStage: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: color.primary,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: radius.cta + 10,
    borderCurve: "continuous",
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: color.onPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.66)",
  },
  track: {
    marginTop: 20,
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  trackFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: color.primary,
  },
  footer: {
    position: "absolute",
    bottom: 44,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
  },
});
