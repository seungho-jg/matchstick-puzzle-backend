import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'
import { CreatePuzzleDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';

@Injectable()
export class PuzzlesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPuzzleDto: CreatePuzzleDto) {
    return this.prisma.puzzle.create({ data: createPuzzleDto})
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
      data: updatePuzzleDto,
    });
  }

  remove(id: number) {
    return this.prisma.puzzle.delete({ where: { id }});
  }
}
