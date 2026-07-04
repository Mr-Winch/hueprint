export function polarToXY(centerX: number, centerY: number, radius: number, hueDeg: number) {
  const angle = ((hueDeg + 180) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
