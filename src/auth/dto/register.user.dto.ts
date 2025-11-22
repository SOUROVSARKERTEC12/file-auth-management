import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/user/enum/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd123!', description: 'User password (must be strong)' })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsStrongPassword()
  @IsString()
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER, description: 'User role (default: user)' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role.' })
  role: UserRole;
}
