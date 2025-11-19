import { IsOptional, IsString } from 'class-validator';

export class TokenDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsString()
  refreshToken: string;
}
