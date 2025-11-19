import { IsOptional, IsString } from 'class-validator';

export class ReturnTokenDto {
  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsString()
  refreshToken: string;
}
