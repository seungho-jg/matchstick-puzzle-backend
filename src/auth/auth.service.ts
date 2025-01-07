import * as bcrypt from 'bcrypt';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendVerificationEmail } from './utils/mailer';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto : LoginDto) {
    const { email, password } = loginDto;
    
    // 이메일로 사용자 찾기
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 이메일 인증 여부 확인
    if (!user.isVerified) {
      throw new UnauthorizedException('이메일 인증이 필요합니다. 이메일을 확인해 주세요.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // JWT 토큰 생성
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    };
  }

  async register(registerDto: CreateUserDto) {
    try {
      // 이메일 중복 검사
      const existingEmail = await this.usersService.findByEmail(registerDto.email);
      if (existingEmail) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }

      // 닉네임 중복 검사
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: registerDto.username }
      });
      if (existingUsername) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }

      const user = await this.usersService.create(registerDto);

      // 이메일 전송
      try {
        await sendVerificationEmail(user.email, user.username, user.verificationToken as string);
      } catch (error) {
        console.error('이메일 전송 오류:', error);
        // 사용자 삭제 (롤백)
        await this.prisma.user.delete({ where: { id: user.id } });
        throw new Error('이메일 전송에 실패했습니다. 다시 시도해 주세요.');
      } 

      return { 
        success: true,
        message: '회원가입이 완료되었습니다. 이메일을 확인해 주세요.'
      };

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // 중복 에러는 그대로 전달
      }
      // 기타 에러 처리
      console.error('회원가입 오류:', error);
      throw new Error('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true, // 인증 완료
        verificationToken: null, // 토큰제거
      }
    })

    return { message: 'Email verified successfully. You can now log in.'}
  }
}
