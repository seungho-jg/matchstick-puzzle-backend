import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 헤더에서 JWT 추출
      ignoreExpiration: false, // 만료된 토큰 거부
      secretOrKey: process.env.JWT_SECRET, // JWT 서명 검증에 사용할 비밀 키
    });
  }

  async validate(payload: any) {
    // 토큰이 유효하면 사용자 정보를 반환
    return { userId: payload.sub, username: payload.username };
  }
}