import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';

@Injectable()
export class PuzzlesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPuzzleDto: CreatePuzzleDto) {
    return this.prisma.puzzle.create({ data: {
      title: createPuzzleDto.title,
      gameType: createPuzzleDto.gameType,
      limit: createPuzzleDto.limit,
      difficulty: createPuzzleDto.difficulty ?? 'Unrated',
      initialState: JSON.stringify(createPuzzleDto.initialState),
      solution: JSON.stringify(createPuzzleDto.solution),
      category: JSON.stringify(createPuzzleDto.category),
      createBy: createPuzzleDto.createBy,
      likes: 0,
    }})
  }

  findAll() {
    return this.prisma.puzzle.findMany();
  }

  findOne(id: number) {
    return this.prisma.puzzle.findUnique({ where: { id }});
  }

  update(id: number, updatePuzzleDto: UpdatePuzzleDto) {
    return this.prisma.puzzle.update({
      where: { id },
      data: {
        title: updatePuzzleDto.title,
        
      },
    });
  }

  remove(id: number) {
    return this.prisma.puzzle.delete({ where: { id }});
  }
}
