import styles from "./ColorHarmonyPicker.module.css";
import { polarToXY } from "./colorHarmony.geometry";
import { clamp, hexToHsl, isTonalRule, normalizeHue } from "./colorHarmony.math";
import { GeneratedColor, HarmonyRule, isPaletteRecipeSource } from "./colorHarmony.types";

type HarmonyOverlayProps = {
  colors: GeneratedColor[];
  activeHex: string;
  rule: HarmonyRule;
  recipeMode?: boolean;
  size?: number;
};

type Point = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  color: GeneratedColor;
};

type Connector = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
};

const LIGHTNESS_MIN = 0.08;
const LIGHTNESS_MAX = 0.92;
const WHEEL_RENDER_SIZE = 184;
const WHEEL_RENDER_THICKNESS = 34;
const OVERLAY_MARKER_RADIUS = 8.75;
const CONNECTOR_INSET = 7.25;

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

function pointForColor(size: number, color: GeneratedColor): Point {
  const recipeSource = isPaletteRecipeSource(color.sourceRule);
  const hsl = hexToHsl(color.hex, color.hue);
  const hue = recipeSource && color.oklch ? color.oklch.h : color.hue;
  const lightness = recipeSource && color.oklch ? color.oklch.l : hsl.l;
  const radius = radiusFromLightness(size, lightness);
  const point = polarToXY(size / 2, size / 2, radius, hue);
  return { ...point, radius, hue, color };
}

function uniqueHuePoints(points: Point[]) {
  return points.filter((point, index) => points.findIndex((candidate) => hueDistance(candidate.hue, point.hue) < 1) === index);
}

function recipeOverlayPoints(points: Point[], activePoint: Point) {
  return [...points].sort((a, b) => {
    const aHue = normalizeHue(a.hue - activePoint.hue);
    const bHue = normalizeHue(b.hue - activePoint.hue);
    if (Math.abs(aHue - bHue) > 1) return aHue - bHue;
    return b.radius - a.radius;
  });
}

function connectorBetween(start: Point, end: Point, index: number): Connector | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= 2) return null;

  const inset = Math.min(CONNECTOR_INSET, distance / 2 - 1);
  const ux = dx / distance;
  const uy = dy / distance;
  return {
    x1: start.x + ux * inset,
    y1: start.y + uy * inset,
    x2: end.x - ux * inset,
    y2: end.y - uy * inset,
    key: `${start.color.id}-${end.color.id}-${index}`,
  };
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

export function HarmonyOverlay({ colors, activeHex, rule, recipeMode = false, size = 240 }: HarmonyOverlayProps) {
  if (isTonalRule(rule) || colors.length < 2) return null;

  const points = colors.map((color) => pointForColor(size, color));
  const active = activeHex.toUpperCase();
  const activePoint = points.find((point) => point.color.hex.toUpperCase() === active) ?? points[0];
  const overlayPoints = recipeMode ? recipeOverlayPoints(points, activePoint) : rule === "complementary" ? uniqueHuePoints(points) : points;
  const pairs = rule === "complementary" && !recipeMode ? complementaryPairs(points, activePoint.hue) : [];
  const connectorPairs = overlayPoints.flatMap((point, index) => {
    const next = overlayPoints[index + 1] ?? (overlayPoints.length > 2 ? overlayPoints[0] : null);
    return next ? [[point, next] as const] : [];
  });
  const connectors = (pairs.length ? pairs : connectorPairs)
    .map(([start, end], index) => connectorBetween(start, end, index))
    .filter((connector): connector is Connector => connector != null);

  return (
    <svg className={styles.overlay} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {connectors.map((connector) => (
        <line
          key={connector.key}
          x1={connector.x1}
          y1={connector.y1}
          x2={connector.x2}
          y2={connector.y2}
          className={styles.overlayLine}
        />
      ))}
      {overlayPoints.map((point) => {
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

