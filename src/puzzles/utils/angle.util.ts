export function normalizeAngle(angle: number): number {
  return angle % 180; // 0~179 범위로 변환
} 