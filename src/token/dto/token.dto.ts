import { IsString } from 'class-validator';

export class ReturnTokenDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}

