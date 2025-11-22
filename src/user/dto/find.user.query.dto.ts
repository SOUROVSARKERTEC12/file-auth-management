import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { UserRole } from '../enum/role.enum';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindUserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Filter by email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER, description: 'Filter by user role' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'John', description: 'Search in first name, last name, or email (max 30 characters)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  search?: string;
}
