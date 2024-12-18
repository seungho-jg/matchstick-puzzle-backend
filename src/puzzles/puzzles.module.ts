import { Module } from '@nestjs/common';
import { PuzzlesService } from './puzzles.service';
import { PuzzlesController } from './puzzles.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PuzzlesController],
  providers: [PuzzlesService],
})
export class PuzzlesModule {}
