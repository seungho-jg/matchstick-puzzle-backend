import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PuzzlesModule } from './puzzles/puzzles.module';
import { AuthModule } from './auth/auth.module';
import { LikesModule } from './likes/likes.module';
import { AdminModule } from './admin/admin.module';


@Module({
  imports : [
    PrismaModule,
    UsersModule,
    PuzzlesModule,
    AuthModule,
    LikesModule,
    AdminModule
  ]
})
class RootModule {}

async function bootstrap() {
  const app = await NestFactory.create(RootModule);

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의된 속성만 허용
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성은 에러 처리
      transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 변환
    })
  )
  // CORS 활성화
  app.enableCors({
    origin: ['https://matchstick-puzzle-front.pages.dev', 'https://matchstick-puzzle.com'], // 프론트엔드 주소
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
