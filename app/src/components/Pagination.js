import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../theme/tokens.js";

const { color, space, radius, shadow } = tokens;

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPrev,
  onNext,
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const canPrev = page > 0;
  const canNext = page < pageCount - 1;

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onPrev}
        disabled={!canPrev}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Sebelumnya"
        accessibilityState={{ disabled: !canPrev }}
        style={({ pressed }) => [
          styles.button,
          !canPrev && styles.buttonDisabled,
          pressed && canPrev && styles.pressed,
        ]}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={canPrev ? color.primary : color.text3}
        />
        <Text style={[styles.buttonText, !canPrev && styles.buttonTextDisabled]}>
          Sebelumnya
        </Text>
      </Pressable>

      <View
        style={styles.counter}
        accessible
        accessibilityLabel={`Halaman ${page + 1} dari ${pageCount}, data ${from} sampai ${to} dari ${total}`}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.pageText}>
          {page + 1} / {pageCount}
        </Text>
        <Text style={styles.rangeText} numberOfLines={1}>
          Data {from}–{to} dari {total}
        </Text>
      </View>

      <Pressable
        onPress={onNext}
        disabled={!canNext}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Berikutnya"
        accessibilityState={{ disabled: !canNext }}
        style={({ pressed }) => [
          styles.button,
          !canNext && styles.buttonDisabled,
          pressed && canNext && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonText, !canNext && styles.buttonTextDisabled]}>
          Berikutnya
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={canNext ? color.primary : color.text3}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.card,
    borderCurve: "continuous",
    boxShadow: shadow.card,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    marginBottom: space.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: tokens.hit,
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: radius.chip,
    borderCurve: "continuous",
    backgroundColor: color.surface2,
  },
  buttonDisabled: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: color.primary,
  },
  buttonTextDisabled: {
    color: color.text3,
  },
  counter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  pageText: {
    fontSize: 14,
    fontWeight: "700",
    color: color.text,
    fontVariant: ["tabular-nums"],
  },
  rangeText: {
    fontSize: 11,
    color: color.text3,
    fontVariant: ["tabular-nums"],
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
