import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import {
  Atlas,
  Canvas,
  Circle,
  FilterMode,
  Group,
  MipmapMode,
  RadialGradient,
  Skia,
  rect,
  useRSXformBuffer,
  usePictureAsTexture,
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

// "Aurora bands": the globe is built from latitude bands that swirl and ripple,
// instead of the evenly scattered dot shell it used to be.
const BANDS = 18;
const PTS_PER_BAND = 28;
const HOLE_RADIUS = 72;
const BASE_SPEED = 0.32;
const TILT = 0.35;
const TEX = 32;
const RIPPLE = 0.055;
const SWIRL = 0.42;

function buildBands() {
  const pts = [];
  for (let b = 0; b < BANDS; b++) {
    const lat = ((b + 0.5) / BANDS - 0.5) * Math.PI;
    const y = Math.sin(lat);
    const ring = Math.cos(lat);
    // Fewer dots near the poles so spacing stays even across every band.
    const count = Math.max(6, Math.round(PTS_PER_BAND * ring));
    const twist = b * SWIRL;
    for (let k = 0; k < count; k++) {
      const lon = (k / count) * Math.PI * 2 + twist;
      pts.push([Math.cos(lon) * ring, y, Math.sin(lon) * ring, b]);
    }
  }
  return pts;
}

const BASE_PTS = buildBands();
const DOT_COUNT = BASE_PTS.length;

function bandEmphasis(band) {
  return 0.82 + 0.22 * Math.sin(band * 1.25);
}

// Plain-JS projection shared by the mount precompute (no runtime needed).
function projectAll(angle, swell, R, cx, cy) {
  const out = new Array(DOT_COUNT);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const tilt = TILT + Math.sin(angle * 0.5) * 0.05;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  for (let i = 0; i < DOT_COUNT; i++) {
    const p = BASE_PTS[i];
    const wave = 1 + RIPPLE * Math.sin(angle * 1.7 - p[3] * 0.55);
    const rr = R * swell * wave;
    const x1 = p[0] * cosA + p[2] * sinA;
    const z1 = -p[0] * sinA + p[2] * cosA;
    const y1 = p[1] * cosT - z1 * sinT;
    const z2 = p[1] * sinT + z1 * cosT;
    const depth = (z2 + 1) / 2;
    const s = 2.2 / (2.2 - z2);
    const sx = cx + x1 * rr * s;
    const sy = cy + y1 * rr * s;
    const hx = sx - cx;
    const hy = sy - cy;
    const hidden = hx * hx + hy * hy < HOLE_RADIUS * HOLE_RADIUS;
    const sc = 0.17 * (0.55 + 0.9 * depth) * swell * bandEmphasis(p[3]);
    out[i] = hidden
      ? [0, 0, -10000, -10000]
      : [sc, 0, sx - (TEX / 2) * sc, sy - (TEX / 2) * sc];
  }
  return out;
}

export function TempOrb({
  tint = color.text,
  beatKey = 0,
  size = 200,
  dimmed = false,
}) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const angleY = useSharedValue(0.6);
  const spinBoost = useSharedValue(0);
  const intensity = useSharedValue(0);
  const dimSV = useSharedValue(dimmed ? 1 : 0);
  const firstBeat = useRef(true);

  const R = (size * 0.8) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const dotPicture = useMemo(() => {
    try {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(rect(0, 0, TEX, TEX));
      const paint = Skia.Paint();
      paint.setAntiAlias(true);
      paint.setColor(Skia.Color("white"));
      canvas.drawCircle(TEX / 2, TEX / 2, TEX / 2 - 1, paint);
      return recorder.finishRecordingAsPicture();
    } catch {
      return null;
    }
  }, []);
  const dotImg = usePictureAsTexture(dotPicture, { width: TEX, height: TEX });

  const sprites = useMemo(
    () => new Array(DOT_COUNT).fill(0).map(() => rect(0, 0, TEX, TEX)),
    []
  );

  const transforms = useRSXformBuffer(DOT_COUNT, (val, i) => {
    "worklet";
    const p = BASE_PTS[i];
    const a = angleY.value;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const tilt = TILT + Math.sin(a * 0.5) * 0.05;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const swell = 1 + 0.05 * intensity.value;
    const wave = 1 + RIPPLE * Math.sin(a * 1.7 - p[3] * 0.55);
    const rr = R * swell * wave;
    const x1 = p[0] * cosA + p[2] * sinA;
    const z1 = -p[0] * sinA + p[2] * cosA;
    const y1 = p[1] * cosT - z1 * sinT;
    const z2 = p[1] * sinT + z1 * cosT;
    const depth = (z2 + 1) / 2;
    const s = 2.2 / (2.2 - z2);
    const sx = cx + x1 * rr * s;
    const sy = cy + y1 * rr * s;
    const hx = sx - cx;
    const hy = sy - cy;
    if (hx * hx + hy * hy < HOLE_RADIUS * HOLE_RADIUS) {
      val.set(0, 0, -10000, -10000);
      return;
    }
    const band = 0.82 + 0.22 * Math.sin(p[3] * 1.25);
    const sc = 0.17 * (0.55 + 0.9 * depth) * swell * band;
    val.set(sc, 0, sx - (TEX / 2) * sc, sy - (TEX / 2) * sc);
  });

  // First-frame insurance: correct globe even before the first mapper pass.
  useEffect(() => {
    try {
      const initial = projectAll(0.6, 1, R, cx, cy);
      const buffer = transforms.value;
      for (let i = 0; i < buffer.length; i++) {
        buffer[i].set(
          initial[i][0],
          initial[i][1],
          initial[i][2],
          initial[i][3]
        );
      }
    } catch {
      // buffer write unsupported — mapper pass will fill it instead
    }
  }, [transforms, R, cx, cy]);

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
    spinBoost.set(2.4);
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
    angleY.set(angleY.value + dt * (BASE_SPEED + decayedSpin));
  });

  useEffect(() => {
    frame.setActive(focused && !reduceMotion && !dimmed);
  }, [focused, reduceMotion, dimmed, frame]);

  const groupOpacity = useDerivedValue(() => 0.78 * (1 - 0.55 * dimSV.value));
  const glowOpacity = useDerivedValue(
    () => (0.1 + 0.22 * intensity.value) * (1 - 0.7 * dimSV.value)
  );
  const glowRadius = useDerivedValue(
    () => R * (1.12 + 0.08 * intensity.value)
  );

  const colors = useMemo(() => new Array(DOT_COUNT).fill(tint), [tint]);

  return (
    <View style={{ width: size, height: size }} accessible={false}>
      <Canvas style={{ width: size, height: size }}>
        <Group opacity={glowOpacity}>
          <Circle cx={cx} cy={cy} r={glowRadius}>
            <RadialGradient
              c={vec(cx, cy)}
              r={glowRadius}
              colors={[tint, "rgba(0,0,0,0)"]}
            />
          </Circle>
        </Group>
        <Group opacity={groupOpacity}>
          <Atlas
            image={dotImg}
            sprites={sprites}
            transforms={transforms}
            colors={colors}
            colorBlendMode="modulate"
            sampling={{ filter: FilterMode.Linear, mipmap: MipmapMode.Linear }}
          />
        </Group>
      </Canvas>
    </View>
  );
}
