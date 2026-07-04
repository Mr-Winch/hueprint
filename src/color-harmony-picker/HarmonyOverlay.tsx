import styles from "./ColorHarmonyPicker.module.css";
import { polarToXY } from "./colorHarmony.geometry";
import { clamp, hexToHsl, isTonalRule, normalizeHue } from "./colorHarmony.math";
import { GeneratedColor, HarmonyRule } from "./colorHarmony.types";

type HarmonyOverlayProps = {
  colors: GeneratedColor[];
  activeHex: string;
  rule: HarmonyRule;
  size?: number;
};

type Point = {
  x: number;
  y: number;
  lineX: number;
  lineY: number;
  hue: number;
  color: GeneratedColor;
};

const LIGHTNESS_MIN = 0.08;
const LIGHTNESS_MAX = 0.92;
const WHEEL_RENDER_SIZE = 184;
const WHEEL_RENDER_THICKNESS = 34;

function hueDistance(a: number, b: number) {
  const diff = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(diff, 360 - diff);
}

function radiusFromLightness(size: number, lightness: number) {
  const outerRadius = size / 2;
  const thickness = (WHEEL_RENDER_THICKNESS / WHEEL_RENDER_SIZE) * size;
  const innerRadius = outerRadius - thickness;
  const t = clamp((lightness - LIGHTNESS_MIN) / (LIGHTNESS_MAX - LIGHTNESS_MIN), 0, 1);
  return innerRadius + (outerRadius - innerRadius) * t;
}

function pointForColor(size: number, color: GeneratedColor, geometryRadius: number): Point {
  const hsl = hexToHsl(color.hex, color.hue);
  const markerPoint = polarToXY(size / 2, size / 2, radiusFromLightness(size, hsl.l), color.hue);
  const linePoint = polarToXY(size / 2, size / 2, geometryRadius, color.hue);
  return { ...markerPoint, lineX: linePoint.x, lineY: linePoint.y, hue: color.hue, color };
}

function uniqueHuePoints(points: Point[]) {
  return points.filter((point, index) => points.findIndex((candidate) => hueDistance(candidate.hue, point.hue) < 1) === index);
}

function complementaryPairs(points: Point[], activeHue: number) {
  const unique = uniqueHuePoints(points);
  const near = unique.filter((point) => hueDistance(point.hue, activeHue) <= 45);
  const far = unique.filter((point) => hueDistance(point.hue, normalizeHue(activeHue + 180)) <= 45);
  if (!near.length || !far.length) return [];

  if (near.length === far.length) return near.map((point, index) => [point, far[index]] as const);
  if (far.length === 1) return near.map((point) => [point, far[0]] as const);
  if (near.length === 1) return far.map((point) => [near[0], point] as const);

  const pairs: Array<readonly [Point, Point]> = [];
  const max = Math.min(near.length, far.length);
  for (let index = 0; index < max; index += 1) pairs.push([near[index], far[index]]);
  return pairs;
}

export function HarmonyOverlay({ colors, activeHex, rule, size = 240 }: HarmonyOverlayProps) {
  if (isTonalRule(rule) || colors.length < 2) return null;

  const activeHsl = hexToHsl(activeHex, colors[0]?.hue ?? 0);
  const geometryRadius = radiusFromLightness(size, activeHsl.l);
  const points = colors.map((color) => pointForColor(size, color, geometryRadius));
  const active = activeHex.toUpperCase();
  const activePoint = points.find((point) => point.color.hex.toUpperCase() === active) ?? points[0];
  const uniquePoints = uniqueHuePoints(points);
  const polygonPoints = uniquePoints.map((point) => `${point.lineX},${point.lineY}`).join(" ");
  const pairs = rule === "complementary" ? complementaryPairs(points, activePoint.hue) : [];

  return (
    <svg className={styles.overlay} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {rule === "complementary" && pairs.length ? (
        pairs.map(([start, end]) => (
          <line
            key={`${start.color.id}-${end.color.id}`}
            x1={start.lineX}
            y1={start.lineY}
            x2={end.lineX}
            y2={end.lineY}
            className={styles.overlayLine}
          />
        ))
      ) : uniquePoints.length === 2 ? (
        <line
          x1={uniquePoints[0].lineX}
          y1={uniquePoints[0].lineY}
          x2={uniquePoints[1].lineX}
          y2={uniquePoints[1].lineY}
          className={styles.overlayLine}
        />
      ) : (
        <polygon points={polygonPoints} className={styles.overlayLine} fill="none" />
      )}
      {uniquePoints.map((point) => {
        if (point.color.hex.toUpperCase() === active) return null;
        return (
          <g key={`${point.color.id}-marker`}>
            <circle cx={point.x} cy={point.y} r="8.75" className={styles.overlayDotOuter} />
            <circle cx={point.x} cy={point.y} r="7" className={styles.overlayDot} style={{ fill: point.color.hex }} />
          </g>
        );
      })}
    </svg>
  );
}