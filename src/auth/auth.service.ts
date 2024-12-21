import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendVerificationEmail } from './utils/mailer';
import { generateVarificationToken } from './utils/token-generator';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto : LoginDto) {
    const { email, password } = loginDto;
    
    // 이메일로 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Invalid email or password.');
    }

    // 이메일 인증 여부 확인
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.')
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    console.log("login OK: ", user.username)
    // JWT 토큰 생성
    const payload = { userId: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    return { token, message: 'Login successful.'};
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

      // 중복 검사
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        'Username or email is already taken. Please choose another.',
      );
    }
  
    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 인증 토큰 생성
    const verificationToken = generateVarificationToken();

    // 사용자 저장
    await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken // 인증 토큰 저장
      }
    });

    // 이메일 전송
    try{
      await sendVerificationEmail(email, username, verificationToken)
    } catch {
      console.log("이메일 오류")
    } 

    return { message: 'User registered successfully. please check your email to verify your account.'};
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
