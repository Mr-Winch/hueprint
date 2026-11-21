export const DEFAULT_WHEEL_SIZE = 184;
export const DEFAULT_WHEEL_THICKNESS = 34;
export const DEFAULT_WHEEL_RING_RATIO = DEFAULT_WHEEL_THICKNESS / DEFAULT_WHEEL_SIZE;

export function polarToXY(centerX: number, centerY: number, radius: number, hueDeg: number) {
  const angle = ((hueDeg + 180) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
