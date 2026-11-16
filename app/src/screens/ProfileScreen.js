import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";
import { tokens } from "../theme/tokens.js";
import { MQTT_BROKER_URL, MQTT_TOPIC } from "../services/config.js";

const { color, space, radius, shadow } = tokens;

const GROUP = {
  number: "21",
  course: "Praktikum Pemrograman Perangkat Bergerak",
  module: "Modul 6 · React Native",
  members: [
    { nim: "21120124130082", name: "Aisha Alida Putri" },
    { nim: "21120124120025", name: "Oktavia Damayanti" },
    { nim: "21120124130086", name: "Rizkia Rahman" },
    { nim: "21120123130066", name: "Shata' Hibrizi Al Fa'iq" },
  ],
};

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={color.text2} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} selectable>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const reduceMotion = useReducedMotion();
  const entering = reduceMotion
    ? FadeIn.duration(150)
    : FadeInDown.duration(tokens.motion.entering);

  const brokerHost = useMemo(() => {
    if (!MQTT_BROKER_URL) return "Belum diatur";
    return MQTT_BROKER_URL.replace(/^\w+:\/\//, "").split("/")[0];
  }, []);

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View style={styles.heroCard} entering={entering}>
          <View style={styles.badge}>
            <Text style={styles.badgeNumber}>{GROUP.number}</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Kelompok {GROUP.number}</Text>
            <Text style={styles.heroSubtitle}>{GROUP.course}</Text>
            <View style={styles.modulePill}>
              <Text style={styles.moduleText}>{GROUP.module}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={18} color={color.text2} />
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Anggota Kelompok
          </Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{GROUP.members.length} orang</Text>
          </View>
        </View>

        <View style={styles.card}>
          {GROUP.members.map((member, index) => (
            <View
              key={member.nim}
              style={[styles.memberRow, index > 0 && styles.memberRowDivider]}
              accessible
              accessibilityLabel={`${member.name}, NIM ${member.nim}`}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(member.name)}</Text>
              </View>
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberNim}>{member.nim}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={color.text2}
          />
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Tentang Aplikasi
          </Text>
        </View>

        <View style={styles.card}>
          <InfoRow icon="pulse" label="Aplikasi" value="LiveTemp" />
          <View style={styles.infoDivider} />
          <InfoRow icon="layers-outline" label="Versi" value={version} />
          <View style={styles.infoDivider} />
          <InfoRow icon="git-branch-outline" label="Topik MQTT" value={MQTT_TOPIC ?? "Belum diatur"} />
          <View style={styles.infoDivider} />
          <InfoRow icon="cloud-outline" label="Broker MQTT" value={brokerHost} />
        </View>

        <Text style={styles.footer}>
          Kelompok {GROUP.number} · Praktikum PPB · 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: color.bg,
  },
  container: {
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.md,
    backgroundColor: color.bg,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: color.border,
    boxShadow: shadow.card,
    padding: space.xl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: color.onPrimary,
    fontVariant: ["tabular-nums"],
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: tokens.type.title,
    fontWeight: "700",
    color: color.text,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: color.text2,
  },
  modulePill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderCurve: "continuous",
    backgroundColor: color.surface2,
  },
  moduleText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.text2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: tokens.type.section,
    fontWeight: "700",
    color: color.text,
  },
  countPill: {
    backgroundColor: color.surface2,
    borderRadius: radius.pill,
    borderCurve: "continuous",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.text2,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.card,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: color.border,
    boxShadow: shadow.card,
    overflow: "hidden",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    minHeight: 64,
  },
  memberRowDivider: {
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: color.primary,
    letterSpacing: 0.2,
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: color.text,
  },
  memberNim: {
    fontSize: 12,
    color: color.text2,
    fontFamily: "monospace",
    fontVariant: ["tabular-nums"],
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 12,
    paddingHorizontal: space.lg,
    minHeight: 56,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: color.text3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: color.text,
  },
  infoDivider: {
    height: 1,
    backgroundColor: color.border,
    marginLeft: 60,
  },
  footer: {
    marginTop: space.md,
    textAlign: "center",
    fontSize: 12,
    color: color.text3,
  },
});
