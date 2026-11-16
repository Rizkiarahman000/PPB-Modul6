import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../theme/tokens.js";

const { color, space, radius, shadow } = tokens;
const ARROW = 12;
const GAP = ARROW + 6;

export function GuideOverlay({ active, steps, index, total, layout, onNext, onSkip }) {
  const { width, height } = useWindowDimensions();
  const step = steps?.[index];

  if (!active || !step || !layout) return null;

  const bubbleW = width - space.lg * 2;
  const bubbleLeft = (width - bubbleW) / 2;
  const targetCX = layout.x + layout.width / 2;

  const placeBelow = layout.y + layout.height + GAP + 148 <= height;

  const posStyle = placeBelow
    ? { top: layout.y + layout.height + GAP }
    : { bottom: height - layout.y + GAP };

  const arrowLeft = Math.max(bubbleLeft + 24, Math.min(bubbleLeft + bubbleW - 24, targetCX));

  const isLast = index === total - 1;

  return (
    <Modal
      transparent
      statusBarTranslucent
      animationType="fade"
      visible
      onRequestClose={onSkip}
    >
      <View style={styles.full}>
        <View style={[styles.mask, { top: 0, left: 0, right: 0, height: layout.y }]} />
        <View
          style={[
            styles.mask,
            {
              top: layout.y + layout.height,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
        <View
          style={[
            styles.mask,
            { top: layout.y, left: 0, width: layout.x, height: layout.height },
          ]}
        />
        <View
          style={[
            styles.mask,
            {
              top: layout.y,
              left: layout.x + layout.width,
              right: 0,
              height: layout.height,
            },
          ]}
        />

        <View
          style={[
            styles.highlight,
            {
              left: layout.x,
              top: layout.y,
              width: layout.width,
              height: layout.height,
            },
          ]}
        />

        <View
          style={[
            styles.bubble,
            posStyle,
            { left: bubbleLeft, width: bubbleW },
          ]}
          accessible
          accessibilityViewIsModal
        >
          <View style={[styles.arrowWrap, placeBelow ? styles.arrowTop : styles.arrowBottom, { left: arrowLeft - bubbleLeft }]}>
            <View style={placeBelow ? styles.arrowUp : styles.arrowDown} />
          </View>

          <View style={styles.bubbleHeader}>
            <Text style={styles.counter}>
              {index + 1}/{total}
            </Text>
            <Pressable
              onPress={onSkip}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Lewati panduan"
            >
              <Text style={styles.skipText}>Lewati</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.bubbleFooter}>
            <View style={styles.dots} accessibilityLabel={`Langkah ${index + 1} dari ${total}`}>
              {steps.map((s, i) => (
                <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
            <Pressable
              onPress={onNext}
              accessibilityRole="button"
              accessibilityLabel={isLast ? "Selesai" : "Berikutnya"}
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
            >
              <Text style={styles.nextText}>{isLast ? "Selesai" : "Berikutnya"}</Text>
              <Ionicons name={isLast ? "checkmark" : "arrow-forward"} size={16} color={color.onPrimary} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  mask: {
    position: "absolute",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  highlight: {
    position: "absolute",
    borderWidth: 2,
    borderColor: color.primary,
    borderRadius: radius.card,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  bubble: {
    position: "absolute",
    backgroundColor: color.surface,
    borderRadius: radius.cta,
    borderCurve: "continuous",
    padding: space.lg,
    boxShadow: shadow.card,
  },
  arrowWrap: {
    position: "absolute",
    width: ARROW * 2,
    height: ARROW,
  },
  arrowTop: {
    top: -ARROW,
  },
  arrowBottom: {
    bottom: -ARROW,
  },
  arrowUp: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderBottomWidth: ARROW,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: color.surface,
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW,
    borderRightWidth: ARROW,
    borderTopWidth: ARROW,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: color.surface,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.sm,
  },
  counter: {
    fontSize: 12,
    fontWeight: "600",
    color: color.text3,
    fontVariant: ["tabular-nums"],
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600",
    color: color.text3,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: color.text,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: color.text2,
    marginTop: 4,
  },
  bubbleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.md,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: color.border,
  },
  dotActive: {
    width: 18,
    backgroundColor: color.primary,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: color.primary,
    borderRadius: radius.cta,
    borderCurve: "continuous",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  nextText: {
    color: color.onPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});