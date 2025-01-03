import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePuzzleDto, MatchstickDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { calculateExpBonus, calculateLevelUp } from 'src/users/utils/level.util';
import { checkMoveSimilarity, checkRemoveSimilarity } from './utils/similarity.util';

@Injectable()
export class PuzzlesService {
  constructor(private readonly prisma: PrismaService) {}

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
      const answers = solution.answer as unknown as MatchstickDto[][]

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

  create(createPuzzleDto: CreatePuzzleDto) {
    return this.prisma.puzzle.create({ data: {
      title: createPuzzleDto.title,
      gameType: createPuzzleDto.gameType,
      limit: createPuzzleDto.limit,
      difficulty: createPuzzleDto.difficulty ?? 'Unrated',
      initialState: JSON.stringify(createPuzzleDto.initialState),
      category: JSON.stringify(createPuzzleDto.category),
      createBy: createPuzzleDto.createBy
    }})
  }

  findAll() {
    return this.prisma.puzzle.findMany();
  }

  findOne(id: number) {
    return this.prisma.puzzle.findUnique({
       where: { id },
       include: {
        _count: {
          select: { likes: true }
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
        // solution: JSON.stringify(updatePuzzleDto.solution),
        category: JSON.stringify(updatePuzzleDto.category),
        createBy: updatePuzzleDto.createBy,
        attemptedCount: updatePuzzleDto.likes,
      },
    });
  }

  remove(id: number) {
    return this.prisma.puzzle.delete({ where: { id }});
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
      console.log('Updating attempted count...');
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
      console.log('Puzzle not correct');
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

    // 경험치 계산
    const expBonus = calculateExpBonus(puzzle.difficulty, user.level);
    const { newLevel, newExp } = calculateLevelUp(user.level, user.exp + expBonus);

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
