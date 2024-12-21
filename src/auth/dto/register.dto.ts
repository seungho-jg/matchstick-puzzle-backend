import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.'})
  readonly password: string;
}
