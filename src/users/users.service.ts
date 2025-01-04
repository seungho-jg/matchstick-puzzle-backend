import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateVarificationToken } from 'src/auth/utils/token-generator';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationToken = generateVarificationToken();

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        verificationToken,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isVerified: true,
        verificationToken: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }});
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        level: true,
        totalExp: true,
        createdPuzzles: true,
      },
      orderBy: {
        level: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id }});
  }

  async getUserPuzzleInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        level: true,
        exp: true,
        solvedPuzzles: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            gameType: true,
            createAt: true,
          }
        },
        attemptedPuzzles: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            gameType: true,
            createAt: true,
          }
        },
      }
    });

    if (!user) throw new NotFoundException('User not found');

    // 시도했지만 성공하지 못한 퍼즐 필터링
    const onlyAttempted = user.attemptedPuzzles.filter(
      attemptedPuzzle => !user.solvedPuzzles.some(
        solvedPuzzle => solvedPuzzle.id === attemptedPuzzle.id
      )
    );

    // 제작한 퍼즐 조회
    const createdPuzzles = await this.prisma.puzzle.findMany({
      where: {
        createById: userId
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        gameType: true,
        createAt: true,
        _count: {
          select: {
            likes: true,
            solvedByUsers: true,
          }
        }
      }
    });

    return {
      user: {
        level: user.level,
        exp: user.exp,
      },
      solved: user.solvedPuzzles,
      attempted: onlyAttempted,  // 필터링된 데이터
      created: createdPuzzles,
      stats: {
        totalSolved: user.solvedPuzzles.length,
        totalAttempted: onlyAttempted.length,  // 수정된 통계
        totalCreated: createdPuzzles.length
      }
    };
  }
}
