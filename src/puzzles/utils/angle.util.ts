export function normalizeAngle(angle: number): number {
  // 먼저 360도 범위로 정규화
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  
  // KonvaJS의 각도 범위(0~90~180~90~0)를 처리
  if (normalized > 180) {
    normalized = 360 - normalized;  // 180도 이상일 때 반전
  }
  
  // 이제 각도는 0~180도 범위 내에 있음
  if (normalized > 90) {
    normalized = 180 - normalized;  // 90도 이상일 때 반전
  }
  
  return normalized;
}