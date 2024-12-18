import { IsString, IsIn, IsInt, IsOptional } from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  title: string;

  @IsString()
  @IsIn(['remove', 'move'])
  gameType: string;

  @IsInt()
  limit: number;

  @IsOptional()
  @IsString()
  @IsIn(['Easy', 'Normal', 'Hard', 'Extreme', 'Unrated'])
  difficulty?: string;

  @IsOptional()
  initialState: Record<string, any>;

  @IsOptional()
  solution: Record<string, any>;

  @IsOptional()
  category: Record<string, any>;

  @IsOptional()
  createBy: string;

  @IsOptional()
  @IsInt()
  likes?: number;

  @IsOptional()
  @IsInt()
  attemptedCount?: number;

  @IsOptional()
  @IsInt()
  correctCount?: number;

  @IsOptional()
  @IsInt()
  totalFeedbackScore?: number;

  @IsOptional()
  @IsInt()
  feedbackCount?: number;
}