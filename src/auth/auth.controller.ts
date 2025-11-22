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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.user.dto';
import { LoginDto } from './dto/login.user.dto';
import { JwtAuthGuard } from './guard/jw.auth.guard';
import { TokenDto } from 'src/token/dto/token.dto';
import { Roles } from './decorator/roles.decorator';
import { UserRole } from 'src/user/enum/role.enum';
import { RolesGuard } from './guard/roles.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Public endpoint to register a new user. Admin role cannot be registered through this endpoint.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiBadRequestResponse({
    description: 'Email already exists or validation failed',
  })
  @ApiForbiddenResponse({ description: 'Cannot register as admin' })
  register(@Body() registerDto: RegisterDto) {
    if (registerDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot register as admin');
    }
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register a new admin user',
    description:
      'Protected endpoint (Admin only) to register a new admin user.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Admin user successfully registered',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  @ApiBadRequestResponse({
    description: 'Email already exists or validation failed',
  })
  registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user and receive access and refresh tokens. Rate limited to 5 requests per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access and refresh tokens',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({
    description: 'Rate limit exceeded or validation failed',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: "Get the authenticated user's profile information.",
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Req() req) {
    const userId: string = req.user.id;
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate a new access token using a valid refresh token.',
  })
  @ApiBody({ type: TokenDto })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  @ApiForbiddenResponse({ description: 'Refresh token not found or invalid' })
  async refresh(@Body() refreshTokenDto: TokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate the refresh token to log out the user.',
  })
  @ApiBody({ type: TokenDto })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiForbiddenResponse({ description: 'Refresh token not found or invalid' })
  async logout(@Body() refreshTokenDto: TokenDto) {
    return this.authService.logout(refreshTokenDto);
  }
}
