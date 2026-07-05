"use client";

import { KeyboardEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./ColorHarmonyPicker.module.css";
import { clamp, hexToHsl, hslToHex, normalizeHue } from "./colorHarmony.math";

type ColorHarmonyWheelProps = {
  color: string;
  hue: number;
  onChange: (hex: string) => void;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const LIGHTNESS_MIN = 0.08;
const LIGHTNESS_MAX = 0.92;
const WHEEL_SIZE = 184;
const WHEEL_THICKNESS = 34;

function lightnessToRingT(lightness: number): number {
  return clamp((lightness - LIGHTNESS_MIN) / (LIGHTNESS_MAX - LIGHTNESS_MIN), 0, 1);
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const h = normalizeHue(hue) / 360;
  const s = clamp(saturation, 0, 1);
  const l = clamp(lightness, 0, 1);

  if (s < 0.0001) {
    const channel = Math.round(l * 255);
    return { r: channel, g: channel, b: channel };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hueToChannel = (t: number) => {
    let next = t;
    if (next < 0) next += 1;
    if (next > 1) next -= 1;
    if (next < 1 / 6) return p + (q - p) * 6 * next;
    if (next < 1 / 2) return q;
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
    return p;
  };

  return {
    r: Math.round(hueToChannel(h + 1 / 3) * 255),
    g: Math.round(hueToChannel(h) * 255),
    b: Math.round(hueToChannel(h - 1 / 3) * 255),
  };
}

function pointFromPointer(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();
  const x = clientX - rect.left - rect.width / 2;
  const y = clientY - rect.top - rect.height / 2;
  const outerRadius = rect.width / 2;
  const thickness = Number.parseFloat(getComputedStyle(element).getPropertyValue("--wheel-thickness")) || WHEEL_THICKNESS;
  const innerRadius = outerRadius - thickness;
  const distance = Math.sqrt(x * x + y * y);
  const t = clamp((distance - innerRadius) / (outerRadius - innerRadius), 0, 1);

  return {
    hue: normalizeHue((Math.atan2(y, x) * 180) / Math.PI - 180),
    lightness: LIGHTNESS_MIN + (LIGHTNESS_MAX - LIGHTNESS_MIN) * t,
  };
}

export function ColorHarmonyWheel({ color, hue, onChange }: ColorHarmonyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [wheelMetrics, setWheelMetrics] = useState({ size: WHEEL_SIZE, thickness: WHEEL_THICKNESS });
  const currentHsl = hexToHsl(color, hue);
  const markerStyle = useMemo(() => {
    const angle = ((hue + 180) * Math.PI) / 180;
    const thicknessPct = (wheelMetrics.thickness / wheelMetrics.size) * 100;
    const innerPct = 50 - thicknessPct;
    const radius = innerPct + thicknessPct * lightnessToRingT(currentHsl.l);
    return {
      left: `${(50 + radius * Math.cos(angle)).toFixed(4)}%`,
      top: `${(50 + radius * Math.sin(angle)).toFixed(4)}%`,
      backgroundColor: color,
    };
  }, [color, currentHsl.l, hue, wheelMetrics.size, wheelMetrics.thickness]);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    function syncMetrics() {
      if (!wheel) return;
      const rect = wheel.getBoundingClientRect();
      const size = Math.max(1, Math.round(rect.width || WHEEL_SIZE));
      const thickness = Number.parseFloat(getComputedStyle(wheel).getPropertyValue("--wheel-thickness")) || WHEEL_THICKNESS;
      setWheelMetrics((current) => (current.size === size && current.thickness === thickness ? current : { size, thickness }));
    }

    syncMetrics();
    const observer = new ResizeObserver(syncMetrics);
    observer.observe(wheel);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    const wheel = wheelRef.current;
    if (!canvas || !wheel) return;

    const cssSize = wheelMetrics.size;
    const pixelRatio = window.devicePixelRatio || 1;
    const size = Math.round(cssSize * pixelRatio);
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${cssSize}px`;
    canvas.style.height = `${cssSize}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = context.createImageData(size, size);
    const center = size / 2;
    const outerRadius = size / 2;
    const thickness = Math.max(1, wheelMetrics.thickness * pixelRatio);
    const innerRadius = outerRadius - thickness;
    const edgeSoftness = Math.max(1, pixelRatio);
    const saturation = clamp(currentHsl.s, 0, 1);

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x + 0.5 - center;
        const dy = y + 0.5 - center;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const index = (y * size + x) * 4;

        const innerCoverage = clamp((distance - innerRadius) / edgeSoftness, 0, 1);
        const outerCoverage = clamp((outerRadius - distance) / edgeSoftness, 0, 1);
        const alpha = Math.min(innerCoverage, outerCoverage);

        if (alpha <= 0) {
          image.data[index + 3] = 0;
          continue;
        }

        const t = clamp((distance - innerRadius) / (outerRadius - innerRadius), 0, 1);
        const pixelHue = normalizeHue((Math.atan2(dy, dx) * 180) / Math.PI - 180);
        const lightness = LIGHTNESS_MIN + (LIGHTNESS_MAX - LIGHTNESS_MIN) * t;
        const rgb = hslToRgb(pixelHue, saturation, lightness);
        image.data[index] = rgb.r;
        image.data[index + 1] = rgb.g;
        image.data[index + 2] = rgb.b;
        image.data[index + 3] = Math.round(255 * alpha);
      }
    }

    context.putImageData(image, 0, 0);
  }, [currentHsl.s, wheelMetrics.size, wheelMetrics.thickness]);

  function setColor(nextHue: number, nextLightness = currentHsl.l) {
    onChange(hslToHex({ ...currentHsl, h: normalizeHue(nextHue), l: clamp(nextLightness, LIGHTNESS_MIN, LIGHTNESS_MAX) }));
  }

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    if (!wheelRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromPointer(wheelRef.current, event.clientX, event.clientY);
    setColor(point.hue, point.lightness);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const hueSteps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      PageDown: -15,
      PageUp: 15,
      Home: -hue,
      End: 359 - hue,
    };
    const lightnessSteps: Record<string, number> = {
      ArrowDown: -0.02,
      ArrowUp: 0.02,
    };

    if (event.key in hueSteps) {
      event.preventDefault();
      setColor(hue + hueSteps[event.key]);
    }

    if (event.key in lightnessSteps) {
      event.preventDefault();
      setColor(hue, currentHsl.l + lightnessSteps[event.key]);
    }
  }

  return (
    <div
      ref={wheelRef}
      className={styles.wheel}
      role="slider"
      aria-label="Base hue and lightness"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(hue)}
      tabIndex={0}
      onPointerDown={handlePointer}
      onPointerMove={(event) => {
        if (event.buttons === 1) handlePointer(event);
      }}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} className={styles.wheelCanvas} aria-hidden="true" />
      <div className={styles.wheelHole} aria-hidden="true" />
      <span className={styles.hueMarker} style={markerStyle} />
    </div>
  );
}
