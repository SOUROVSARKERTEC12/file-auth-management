import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFileDto {
  @ApiPropertyOptional({ description: 'User ID (automatically set from JWT token)' })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'updated-filename.pdf', description: 'New filename' })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({ example: 'new-folder', description: 'New folder path' })
  @IsOptional()
  @IsString()
  folder?: string;
}
