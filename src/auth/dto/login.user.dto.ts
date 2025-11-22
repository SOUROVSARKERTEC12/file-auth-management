import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsNotEmpty({ message: 'Email is required for login.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;
  
  @ApiProperty({ example: 'StrongP@ssw0rd123!', description: 'User password' })
  @IsNotEmpty({ message: 'Password is required for login.' })
  @IsString()
  password: string;
}