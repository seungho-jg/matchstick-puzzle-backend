import { IsString, IsNumber } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  title: string;

  @IsString()
  gameType: string;

  @IsNumber()
  limit: number;
}