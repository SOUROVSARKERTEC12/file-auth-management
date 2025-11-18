import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from 'src/user/entity/user.entity';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required.' })
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsStrongPassword()
  @IsString()
  password: string;

  
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role.' })
  role: UserRole;
}
