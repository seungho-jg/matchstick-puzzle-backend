import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('make-admin')
  makeAdmin(@Body() data: { userId: number }) {
    return this.adminService.makeAdmin(data.userId);
  }

  @Post('puzzle/:id/difficulty')
  updatePuzzleDifficulty(
    @Param('id') id: string,
    @Body() data: { difficulty: 'Easy' | 'Normal' | 'Hard' | 'Extreme' }
  ) {
    return this.adminService.updatePuzzleDifficulty(+id, data.difficulty);
  }
}