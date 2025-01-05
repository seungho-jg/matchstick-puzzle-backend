import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePuzzleDto, MatchstickDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { calculateExpBonus, calculateLevelUp } from 'src/users/utils/level.util';
import { checkMoveSimilarity, checkRemoveSimilarity } from './utils/similarity.util';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PuzzlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async checkAnswer(puzzleId: number, answer: MatchstickDto[]) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      include: { solutions: true }
    });

    if (!puzzle) {
      throw new NotFoundException('퍼즐을 찾을 수 없습니다.');
    }

    // 여러 정답 중 하나라도 일치하는지 확인
    const isCorrect = puzzle.solutions.some(solution => {
      // JSON 문자열을 파싱하여 배열로 변환
      const answers = JSON.parse(solution.answer as string) as MatchstickDto[][];
      
      return answers.some((solutionPattern: MatchstickDto[]) => {
        if (puzzle.gameType === 'move') {
          return checkMoveSimilarity(answer, solutionPattern, 30);
        } else if (puzzle.gameType === 'remove') {
          return checkRemoveSimilarity(answer, solutionPattern, puzzle.limit);
        }
        return false;
      });
    });

    return isCorrect;
  }

  async create(userId: number, createPuzzleDto: CreatePuzzleDto) {
    try {
      // DTO 데이터 검증
      const {
        title,
        gameType,
        limit,
        difficulty = 'Unrated',  // 기본값 설정
        initialState,
        solution,
        category = [],  // 기본값 설정
      } = createPuzzleDto;

      // 퍼즐 생성 전에 카운트 차감
      await this.usersService.decreaseCreateCount(userId);


      // 퍼즐 생성
      const puzzle = await this.prisma.puzzle.create({
        data: {
          title,
          gameType,
          limit: Number(limit),  // 문자열로 들어올 경우를 대비해 Number로 변환
          difficulty,
          initialState : JSON.stringify(initialState),
          category : JSON.stringify(category),
          createById: userId,
        }
      });

      // 해답 생성
      await this.prisma.solution.create({
        data: {
          puzzleId: puzzle.id,
          answer: JSON.stringify(solution)  // 여러 해답을 지원하기 위해 배열로 저장
        }
      });

      return {
        success: true,
        puzzleId: puzzle.id,
        message: '퍼즐이 성공적으로 생성되었습니다.'
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error('퍼즐 생성 중 오류 발생:', error)
      throw new Error(error)
    }
  }

  findAll() {
    return this.prisma.puzzle.findMany({
      include: {
        createBy: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: {
            solvedByUsers: true,
            attemptedByUsers: true,
            likes: true
          }
        }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.puzzle.findUnique({
      where: { id },
      include: {
        createBy: {
          select: {
            id: true,
            username: true,
          }
        },
        _count: {
          select: {
            solvedByUsers: true,
            attemptedByUsers: true,
            likes: true
          }
        }
      }
    });
  }

  update(id: number, updatePuzzleDto: UpdatePuzzleDto) {
    return this.prisma.puzzle.update({
      where: { id },
      data: {
        title: updatePuzzleDto.title,
        gameType: updatePuzzleDto.gameType,
        limit: updatePuzzleDto.limit,
        difficulty: updatePuzzleDto.difficulty ?? 'Unrated',
        initialState: JSON.stringify(updatePuzzleDto.initialState),
        category: JSON.stringify(updatePuzzleDto.category),
      },
    });
  }

  async remove(id: number, userId: number) {
    try {
      const puzzle = await this.prisma.puzzle.findFirst({
        where: {
          id,
          createById: userId
        }
      });

      if (!puzzle) {
        throw new NotFoundException(`ID ${id}의 퍼즐을 찾을 수 없거나 삭제 권한이 없습니다.`);
      }

      // 트랜잭션으로 관련된 모든 데이터 삭제
      return await this.prisma.$transaction(async (prisma) => {
        // 연결된 데이터 먼저 삭제
        await prisma.solution.deleteMany({ where: { puzzleId: id } });
        await prisma.like.deleteMany({ where: { puzzleId: id } });
        
        // 다대다 관계 해제
        await prisma.puzzle.update({
          where: { id },
          data: {
            solvedByUsers: { set: [] },
            attemptedByUsers: { set: [] }
          }
        });

        // 마지막으로 퍼즐 삭제
        return await prisma.puzzle.delete({ where: { id } });
      });

    } catch (error) {
      console.error('퍼즐 삭제 중 에러 발생:', error);
      throw error;
    }
  }

  async handlePuzzleSolved(puzzleId: number, userId: number, answer: MatchstickDto[]) {
    
    const isCorrect = await this.checkAnswer(puzzleId, answer);

    // 이미 풀었는지 확인
  const hasAlreadySolved = await this.prisma.user.findFirst({
    where: {
      id: userId,
      solvedPuzzles: {
        some: {
          id: puzzleId
        }
      }
    }
  });

    // 이미 시도한 적이 있는지 확인
    const hasAttempted = await this.prisma.user.findFirst({
      where: {
        id: userId,
        attemptedPuzzles: {
          some: {
            id: puzzleId
          }
        }
      }
    });

    // 처음 시도하는 경우에만 attemptedCount 증가
    if (!hasAttempted) {
      await this.prisma.puzzle.update({
        where: { id: puzzleId },
        data: {
          attemptedCount: { increment: 1 },
          attemptedByUsers: {
            connect: { id: userId }
          }
        }
      });
    }

    if (!isCorrect) {
      return { success: false };
    }

    if (hasAlreadySolved) {
      return {
        success: true,
        alreadySolved: true,
        message: "이미 해결한 문제입니다."
      };
    }

    const puzzle = await this.prisma.puzzle.findUnique({ where: { id: puzzleId }});
    const user = await this.prisma.user.findUnique({ where: { id: userId }});

    if (!puzzle || !user) {
      console.log('Puzzle or user not found:', { puzzle, user });
      throw new NotFoundException('퍼즐 또는 사용자를 찾을 수 없습니다.');
    }
    // TODO: 아래 user.service로 옮겨야함
    // 경험치 계산
    const expBonus = calculateExpBonus(puzzle.difficulty, user.level);
    const { newLevel, newExp } = calculateLevelUp(user.level, user.exp + expBonus);

    if (newLevel > user.level) {
      await this.usersService.increaseCreateCount(userId, 2 * newLevel);
    }
    // 사용자 정보 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        exp: newExp,
        totalExp: { increment: expBonus },
        solvedPuzzles: { connect: { id: puzzleId } }
      },
    });

    return {
      success: true,
      expBonus,
      newLevel,
      newExp,
      levelUp: newLevel > user.level,
    };
  }
}
