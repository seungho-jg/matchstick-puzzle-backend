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

  async searchUsers(query: string) {
    if (!query) {
      return [];  // 빈 검색어인 경우 빈 배열 반환
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query } },
          { username: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        createCount: true,
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

  async makeRole(userId: number, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role },
    });
  }

  async addCreateCredit(userId: number, amount: number) {
    if (!userId || !amount) {
      throw new Error('유효하지 않은 입력값입니다.');
    }

    return this.prisma.user.update({
      where: { 
        id: userId 
      },
      data: { 
        createCount: { 
          increment: amount 
        } 
      },
      select: {
        id: true,
        username: true,
        createCount: true,
      }
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