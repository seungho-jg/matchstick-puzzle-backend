export const DIFFICULTY_EXP = {
  'Unrated': 10,
  'Easy': 10,
  'Normal': 20,
  'Hard': 30,
  'Expert': 40,
} as const;

// 다음 레벨까지 필요한 경험치 계산
export function getRequiredExp(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

// 경험치를 받았을 때 레벨업 처리
export function calculateLevelUp(currentLevel: number, currentExp: number): {
  newLevel: number;
  newExp: number;
} {
  let level = currentLevel;
  let exp = currentExp;

  while (exp >= getRequiredExp(level)) {
    exp -= getRequiredExp(level);
    level++;
  }

  return { newLevel: level, newExp: exp };
}

// 난이도별 경험치 보너스 계산 (레벨이 높을수록 보너스 감소)
export function calculateExpBonus(difficulty: string, userLevel: number): number {
  const baseExp = DIFFICULTY_EXP[difficulty as keyof typeof DIFFICULTY_EXP] || 15;
  const levelPenalty = Math.max(0.5, 1 - (userLevel - 1) * 0.02); // 레벨당 2%씩 감소 (최소 50%)
  
  return Math.floor(baseExp * levelPenalty);
}