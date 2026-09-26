import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { FORMATO_USERNAME } from './create-user.dto.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(FORMATO_USERNAME, {
    message: 'username aceita apenas letras minusculas, numeros e underscore',
  })
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  // string vazia limpa a foto; qualquer outra coisa precisa ser uma URL
  @IsOptional()
  @ValidateIf((_objeto, valor) => valor !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(500)
  avatarUrl?: string;

  // trocar o e-mail e trocar a credencial de login: exige provar quem esta ali
  @IsOptional()
  @IsString()
  @MaxLength(128)
  currentPassword?: string;
}
