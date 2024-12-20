import { Controller, Param, Post, Req } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('puzzles/:id/likes')
export class LikesController {
  constructor(private readonly likeService: LikesService) {}

}
