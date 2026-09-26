import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

// minusculas, numeros e underscore: o handle vai virar URL de perfil
export const FORMATO_USERNAME = /^[a-z0-9_]+$/;

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(FORMATO_USERNAME, {
    message: 'username aceita apenas letras minusculas, numeros e underscore',
  })
  username: string;

  @IsEmail()
  @MaxLength(180)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
