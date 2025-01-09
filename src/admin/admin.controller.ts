import { Controller, Get, Post, Body, UseGuards, Param, Delete, Query } from '@nestjs/common';
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

  @Get('users/search')
  searchUsers(@Query('query') query: string) {
    return this.adminService.searchUsers(query);
  }

  @Post('make-role')
  makeRole(@Body() data: { userId: number, role: string }) {
    return this.adminService.makeRole(+data.userId, data.role);
  }

  @Post('add-create-credit')
  addCreateCredit(@Body() data: { userId: number, amount: number }) {
    return this.adminService.addCreateCredit(+data.userId, +data.amount);
  }

  @Post('puzzle/:id/difficulty')
  updatePuzzleDifficulty(
    @Param('id') id: string,
    @Body() data: { difficulty: 'Easy' | 'Normal' | 'Hard' | 'Extreme' }
  ) {
    return this.adminService.updatePuzzleDifficulty(+id, data.difficulty);
  }

  @Delete('puzzles/:id')
  deletePuzzle(@Param('id') id: string) {
    return this.adminService.deletePuzzle(+id);
  }
}