import { IsString, IsOptional } from 'class-validator';

export class CreateFileDto {
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
