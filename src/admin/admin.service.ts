import { Injectable } from '@nestjs/common';
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

  // 기타 관리자 기능들...
}