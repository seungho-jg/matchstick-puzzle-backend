import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  // 좋아요를 눌렀는지 확인
  async getLike(userId: number, puzzleId: number) {
  const like = await this.prisma.like.findUnique({
    where: { userId_puzzleId_unique: { userId, puzzleId } },
  });
  
  return {
    isLiked: !!like // boolean으로 변환
  };
}
  // 좋아요 추가
  async addLike(userId: number, puzzleId: number) {
    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_puzzleId_unique: { userId, puzzleId } },
    });

    if (existingLike) {
      throw new BadRequestException('이미 좋아요를 눌렀습니다.');
    }

    // 좋아요 추가
    return this.prisma.like.create({
      data: {
        userId,
        puzzleId,
      },
    });
  }

  // 좋아요 제거
  async removeLike(userId: number, puzzleId: number) {
    // 좋아요가 있는지 확인
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_puzzleId_unique: { userId, puzzleId } },
    });

    if (!existingLike) {
      throw new NotFoundException('좋아요를 찾을 수 없습니다.');
    }

    // 좋아요 제거
    return this.prisma.like.delete({
      where: { userId_puzzleId_unique: { userId, puzzleId } },
    });
  }
}