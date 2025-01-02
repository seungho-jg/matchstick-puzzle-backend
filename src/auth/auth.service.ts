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
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    };
    const token = this.jwtService.sign(payload);
    return { token, message: 'Login successful.'};
  }

  async register(registerDto: CreateUserDto) {

      // 중복 검사
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Username or email is already taken. Please choose another.');
    }

    const user = await this.usersService.create(registerDto);

    // 이메일 전송
    try{
      await sendVerificationEmail(user.email, user.username, user.verificationToken as string);
    } catch (error) {
      console.error(error);
      throw new Error('Email Error');
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
