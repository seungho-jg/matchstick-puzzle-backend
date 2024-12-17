import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { PrismaService } from './prisma.service';
@Module({
  imports: [PuzzlesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
