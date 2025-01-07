import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { CreatePuzzleDto, MatchstickDto } from './dto/create-puzzle.dto';
import { UpdatePuzzleDto } from './dto/update-puzzle.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserPayload } from 'src/types/user.types';

@Controller('puzzles')
export class PuzzlesController {
  constructor(private readonly puzzlesService: PuzzlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: { user: UserPayload },
    @Body() createPuzzleDto: CreatePuzzleDto) {
    return this.puzzlesService.create(+req.user.id, createPuzzleDto);
  }

  @Get()
  findAll() {
    return this.puzzlesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puzzlesService.findOne(+id);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    return this.puzzlesService.update(+id, updatePuzzleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: { user: UserPayload }) {
    return this.puzzlesService.remove(+id, +req.user.id);
  }

  @Post(':id/solve')
  @UseGuards(JwtAuthGuard)
  async solvePuzzle(
    @Param('id') id: string, 
    @Req() req: { user: UserPayload}, 
    @Body() answer : MatchstickDto[]
  ) {
    return this.puzzlesService.handlePuzzleSolved(+id, req.user.id, answer);
  }
}
