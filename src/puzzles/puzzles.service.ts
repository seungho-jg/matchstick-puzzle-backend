import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePuzzleDto, MatchstickDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { calculateExpBonus, calculateLevelUp } from 'src/users/utils/level.util';

@Injectable()
export class PuzzlesService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAngle(angle: number): number {
    return angle % 180; // 0~179 범위로 변환
  }

  private toRelativeCoordinates(sticks: MatchstickDto[]) {
    console.log('toRelativeCoordinates input:', sticks);
    console.log('type of sticks:', typeof sticks);
    
    // JSON string인 경우 파싱
    if (typeof sticks === 'string') {
      sticks = JSON.parse(sticks);
    }
    
    // 전체 중심 좌표 계산
    const centerX = sticks.reduce((sum, stick) => sum + stick.x, 0) / sticks.length;
    const centerY = sticks.reduce((sum, stick) => sum + stick.y, 0) / sticks.length;

    // 각 성냥개비의 상대 좌표 계산
    return sticks.map((stick) => ({
      id: stick.id,
      relativeX: Math.round(stick.x - centerX),
      relativeY: Math.round(stick.y - centerY),
      angle: Math.abs(stick.angle)
    }));
  }

  private checkMoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], threshold = 30): boolean {    
    // 상대 좌표로 변환
    const relativeCurrent = this.toRelativeCoordinates(currentState);
    const relativeSolution = this.toRelativeCoordinates(solution);

    if (relativeCurrent.length !== relativeSolution.length) return false;

    return relativeCurrent.every((currentStick) => {
      return relativeSolution.some((solutionStick) => {
        const positionMatch =
          Math.abs(currentStick.relativeX - solutionStick.relativeX) <= threshold &&
          Math.abs(currentStick.relativeY - solutionStick.relativeY) <= threshold;
        console.log('currentStick: ', currentStick)
        console.log('solutionStick: ', solutionStick)
        const angleMatch =
          this.normalizeAngle(currentStick.angle) - this.normalizeAngle(solutionStick.angle) < threshold;
        console.log('positionMatch: ', positionMatch)
        console.log('angleMatch: ', angleMatch)
        return positionMatch && angleMatch;
      });
    });
  }

  private checkRemoveSimilarity(currentState: MatchstickDto[], solution: MatchstickDto[], limit: number): boolean {
    // 삭제된 성냥개비 찾기
    const removedSticks = currentState.filter(stick => stick.isDeleted);
    
    // 이동 횟수 확인
    if (removedSticks.length !== limit) return false;

    // 삭제된 성냥개비의 id 가져오기
    const removeIds = removedSticks.map(stick => stick.id);
    
    // solution과 비교 (JSON 파싱 불필요)
    return solution.every((solutionStick: MatchstickDto) => 
      removeIds.includes(solutionStick.id)
    );
  }

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
          console.log('solutionPattern: ', solutionPattern)
          return this.checkMoveSimilarity(answer, solutionPattern, 40);
        } else if (puzzle.gameType === 'remove') {
          return this.checkRemoveSimilarity(answer, solutionPattern, puzzle.limit);
        }
        return false;
      });
    });
    console.log('isCorrect: ', isCorrect)

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
    console.log('handlePuzzleSolved called with:', { puzzleId, userId });
    
    const isCorrect = await this.checkAnswer(puzzleId, answer);
    console.log('checkAnswer result:', isCorrect);

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
    console.log('hasAttempted:', hasAttempted);

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

    console.log('Fetching puzzle and user data...');
    const puzzle = await this.prisma.puzzle.findUnique({ where: { id: puzzleId }});
    const user = await this.prisma.user.findUnique({ where: { id: userId }});

    if (!puzzle || !user) {
      console.log('Puzzle or user not found:', { puzzle, user });
      throw new NotFoundException('퍼즐 또는 사용자를 찾을 수 없습니다.');
    }

    // 경험치 계산
    console.log('Calculating exp bonus...');
    const expBonus = calculateExpBonus(puzzle.difficulty, user.level);
    const { newLevel, newExp } = calculateLevelUp(user.level, user.exp + expBonus);

    console.log('Updating user data...');
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

    console.log('Success! Returning result...');
    return {
      success: true,
      expBonus,
      newLevel,
      newExp,
      levelUp: newLevel > user.level,
    };
  }
}
