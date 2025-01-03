import { Type } from 'class-transformer';
import { IsString, IsIn, IsInt, IsOptional, IsArray, ValidateNested, Min, IsBoolean } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  title: string;

  @IsString()
  @IsIn(['remove', 'move'])
  gameType: string;

  @IsInt()
  @Min(0)
  @Type(()=> Number) // 문자열을 숫자로 변환
  limit: number;

  @IsOptional()
  @IsString()
  @IsIn(['Easy', 'Normal', 'Hard', 'Extreme', 'Unrated'])
  difficulty?: string;

  @IsArray()
  @ValidateNested({ each: true})
  @Type(() => MatchstickDto)
  initialState: MatchstickDto[];

  @IsArray()
  @ValidateNested({ each: true})
  @Type(() => MatchstickDto)
  solution: MatchstickDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  category: string[];

  @IsString()
  createBy: string;
}

export class MatchstickDto {
  @IsString()
  id: string;

  @IsInt()
  x: number;

  @IsInt()
  y: number;

  @IsInt()
  angle: number;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}