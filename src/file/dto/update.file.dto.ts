import { IsString, IsOptional } from 'class-validator';

export class UpdateFileDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  folder?: string;
}
