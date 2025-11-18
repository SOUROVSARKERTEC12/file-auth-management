import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email is required for login.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;
  
  @IsNotEmpty({ message: 'Password is required for login.' })
  @IsString()
  password: string;
}