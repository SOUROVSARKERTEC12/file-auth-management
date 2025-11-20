import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.user.dto';
import { LoginDto } from './dto/login.user.dto';
import { JwtAuthGuard } from './guard/jw.auth.guard';
import { TokenDto } from 'src/token/dto/token.dto';
import { Roles } from './decorator/roles.decorator';
import { UserRole } from 'src/user/enum/role.enum';
import { RolesGuard } from './guard/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    if (registerDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot register as admin');
    }
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId: string = req.user.id;
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: TokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: TokenDto) {
    return this.authService.logout(refreshTokenDto);
  }
}
