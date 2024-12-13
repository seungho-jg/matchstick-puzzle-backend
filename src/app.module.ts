import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports: [PuzzlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
