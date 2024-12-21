import { v4 as uuiv4 } from 'uuid';

export function generateVarificationToken(): string {
  return uuiv4(); // 고유한 인증 토큰 생성
}