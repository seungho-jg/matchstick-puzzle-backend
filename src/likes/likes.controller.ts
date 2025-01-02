import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
interface UserPayload {
  id: number;
  username: string;
  email: string;
}
@Controller('puzzles/:id/likes')
@UseGuards(JwtAuthGuard) // 로그인된 사용자만 좋아요 가능
export class LikesController {
  constructor(private readonly likeService: LikesService) {}

  @Get()
  async getLike(@Param('id') puzzleId: string, @Req() req: { user: UserPayload} ){
    const userId = req.user.id
    return this.likeService.getLike(userId, parseInt(puzzleId, 10))
  }

  @Post()
  async addLike(@Param('id') puzzleId: string, @Req() req: { user: UserPayload }){
    const userId = req.user.id
    return this.likeService.addLike(userId, Number(puzzleId))
  }

  @Delete()
  async removeLike(@Param('id') puzzleId: string, @Req() req: { user: UserPayload }) {
    const userId = req.user.id
    return this.likeService.removeLike(userId, Number(puzzleId))
  }
}
