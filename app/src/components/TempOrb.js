import { useEffect, useRef } from "react";
import { View } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  vec,
} from "react-native-skia";
import { useIsFocused } from "@react-navigation/native";
import {
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { tokens } from "../theme/tokens.js";

const { color } = tokens;

// Pulse sphere: a shaded orb with sonar rings rippling outward. The temperature
// number sits on the orb itself, so there are no dots to clash with it.
const RIPPLE_OFFSETS = [0, 1 / 3, 2 / 3];
const BODY_RATIO = 0.29;
const RIPPLE_RATE = 0.42;
const RIPPLE_GROWTH = 0.85;

function withAlpha(hex, alpha) {
  if (typeof hex !== "string" || hex[0] !== "#" || hex.length !== 7) {
    return hex;
  }
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function Ripple({ phase, offset, bodyR, maxR, tint, dimSV, intensity, cx, cy }) {
  const radius = useDerivedValue(() => {
    const p = (phase.value * RIPPLE_RATE + offset) % 1;
    return bodyR + p * (maxR - bodyR);
  });
  const opacity = useDerivedValue(() => {
    const p = (phase.value * RIPPLE_RATE + offset) % 1;
    return (
      Math.pow(1 - p, 1.6) *
      (0.28 + 0.32 * intensity.value) *
      (1 - 0.6 * dimSV.value)
    );
  });

  return (
    <Group opacity={opacity}>
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        style="stroke"
        strokeWidth={1.4}
        color={tint}
      />
    </Group>
  );
}

export function TempOrb({
  tint = color.text,
  beatKey = 0,
  size = 200,
  dimmed = false,
}) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const phase = useSharedValue(0.3);
  const spinBoost = useSharedValue(0);
  const intensity = useSharedValue(0);
  const dimSV = useSharedValue(dimmed ? 1 : 0);
  const firstBeat = useRef(true);

  const cx = size / 2;
  const cy = size / 2;
  const bodyR = size * BODY_RATIO;
  const maxR = Math.min(size / 2 - 2, bodyR * (1 + RIPPLE_GROWTH));

  useEffect(() => {
    dimSV.set(withTiming(dimmed ? 1 : 0, { duration: 400 }));
  }, [dimmed, dimSV]);

  useEffect(() => {
    if (firstBeat.current) {
      firstBeat.current = false;
      return;
    }
    if (!beatKey || dimmed || reduceMotion) return;
    intensity.set(0);
    intensity.set(
      withSequence(
        withTiming(1, { duration: 140 }),
        withTiming(0.35, { duration: 180 }),
        withTiming(0.7, { duration: 120 }),
        withTiming(0, { duration: 300 })
      )
    );
    spinBoost.set(2);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // haptics unsupported — visual beat still plays
    }
  }, [beatKey, dimmed, reduceMotion, intensity, spinBoost]);

  const frame = useFrameCallback((info) => {
    "worklet";
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const decayedSpin = spinBoost.value * Math.pow(0.02, dt);
    spinBoost.set(decayedSpin);
    phase.set(phase.value + dt * (0.55 + decayedSpin * 0.6));
  });

  useEffect(() => {
    frame.setActive(focused && !reduceMotion && !dimmed);
  }, [focused, reduceMotion, dimmed, frame]);

  const bodyScale = useDerivedValue(() => [
    {
      scale:
        1 + 0.015 * Math.sin(phase.value * 1.3) + 0.055 * intensity.value,
    },
  ]);

  const glowOpacity = useDerivedValue(
    () => (0.4 + 0.5 * intensity.value) * (1 - 0.7 * dimSV.value)
  );
  const glowRadius = useDerivedValue(
    () => bodyR * (1.85 + 0.18 * intensity.value)
  );
  const bodyOpacity = useDerivedValue(() => 1 - 0.6 * dimSV.value);

  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <Canvas style={{ width: size, height: size }}>
        <Group opacity={glowOpacity}>
          <Circle cx={cx} cy={cy} r={glowRadius}>
            <RadialGradient
              c={vec(cx, cy)}
              r={glowRadius}
              colors={[withAlpha(tint, 0.26), "rgba(0,0,0,0)"]}
            />
          </Circle>
        </Group>

        {RIPPLE_OFFSETS.map((offset) => (
          <Ripple
            key={offset}
            offset={offset}
            phase={phase}
            bodyR={bodyR}
            maxR={maxR}
            tint={tint}
            dimSV={dimSV}
            intensity={intensity}
            cx={cx}
            cy={cy}
          />
        ))}

        <Group opacity={bodyOpacity}>
          <Group transform={bodyScale} origin={vec(cx, cy)}>
            <Circle cx={cx} cy={cy} r={bodyR}>
              <RadialGradient
                c={vec(cx - bodyR * 0.45, cy - bodyR * 0.5)}
                r={bodyR * 1.75}
                colors={[
                  withAlpha(tint, 0.02),
                  withAlpha(tint, 0.12),
                  withAlpha(tint, 0.28),
                ]}
                positions={[0, 0.55, 1]}
              />
            </Circle>
            <Circle
              cx={cx - bodyR * 0.42}
              cy={cy - bodyR * 0.46}
              r={bodyR * 0.3}
            >
              <RadialGradient
                c={vec(cx - bodyR * 0.42, cy - bodyR * 0.46)}
                r={bodyR * 0.3}
                colors={["rgba(255,255,255,0.85)", "rgba(255,255,255,0)"]}
              />
            </Circle>
            <Circle
              cx={cx}
              cy={cy}
              r={bodyR}
              style="stroke"
              strokeWidth={1}
              color={withAlpha(tint, 0.45)}
            />
          </Group>
        </Group>
      </Canvas>
    </View>
  );
}
