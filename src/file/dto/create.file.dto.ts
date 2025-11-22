import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ example: 'my-document.pdf', description: 'Name of the file' })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ example: 'nestjs-uploads', description: 'Folder path in Cloudinary (default: nestjs-uploads)' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'User ID (automatically set from JWT token)' })
  @IsOptional()
  @IsString()
  userId?: string;
}
