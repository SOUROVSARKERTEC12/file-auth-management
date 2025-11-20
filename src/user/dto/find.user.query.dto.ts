import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { UserRole } from '../enum/role.enum';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class FindUserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  search?: string;
}
