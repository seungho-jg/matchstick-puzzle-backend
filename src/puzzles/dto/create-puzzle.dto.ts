import { IsString, IsNumber } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  readonly title: string;

  @IsString()
  readonly gameType: string;

  @IsNumber()
  readonly limit: number;
}