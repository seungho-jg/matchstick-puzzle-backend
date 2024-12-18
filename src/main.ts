import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports : [
    PrismaModule,
    UsersModule,
    PuzzlesModule
  ]
})
class RootModule {}

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
