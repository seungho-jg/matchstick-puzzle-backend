import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        level: true,
        _count: {
          select: {
            createdPuzzles: true,
            solvedPuzzles: true,
          },
        },
      },
    });
  }

  async makeAdmin(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
  }

  async updatePuzzleDifficulty(puzzleId: number, difficulty: string) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId }
    });

    if (!puzzle) {
      throw new NotFoundException('퍼즐을 찾을 수 없습니다.');
    }

    return this.prisma.puzzle.update({
      where: { id: puzzleId },
      data: { 
        difficulty,
        difficultySetAt: puzzle.difficulty === 'Unrated' ? new Date() : undefined
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        difficultySetAt: true,
        createBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  // 기타 관리자 기능들...
}