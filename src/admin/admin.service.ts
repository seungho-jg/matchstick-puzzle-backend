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

  async deletePuzzle(puzzleId: number) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId }
    });

    if (!puzzle) {
      throw new NotFoundException('퍼즐을 찾을 수 없습니다.');
    }

    // 트랜잭션으로 관련된 모든 데이터 삭제
    return await this.prisma.$transaction(async (prisma) => {
      // 연결된 데이터 먼저 삭제
      await prisma.solution.deleteMany({ where: { puzzleId } });
      await prisma.like.deleteMany({ where: { puzzleId } });
      
      // 다대다 관계 해제
      await prisma.puzzle.update({
        where: { id: puzzleId },
        data: {
          solvedByUsers: { set: [] },
          attemptedByUsers: { set: [] }
        }
      });

      // 마지막으로 퍼즐 삭제
      return await prisma.puzzle.delete({ where: { id: puzzleId } });
    });
  }
}