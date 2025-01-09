import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }
  
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const result = await this.authService.verifyEmail(token);
    return res.redirect(result.redirectUrl);
  }
}
