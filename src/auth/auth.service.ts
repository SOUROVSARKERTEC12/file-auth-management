import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.user.dto';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.user.dto';
import * as argon2 from 'argon2';
import {
  UserResponseDto,
  UserWithPassword,
} from 'src/user/dto/user.response.dto';
import { JwtPayload } from './interface/jwt.payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  /* ----------------------------------------------------
   * Helper: Generate both access + refresh tokens
   * --------------------------------------------------*/
  private generateTokens(user: { id: string; email: string; role: string }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      {
        expiresIn: process.env.REFRESH_JWT_EXPIRES_IN as number | undefined,
      },
    );

    return { accessToken, refreshToken };
  }

  /* ----------------------------------------------------
   * Helper: Save refresh token (inside or outside Tx)
   * --------------------------------------------------*/
  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    manager = this.dataSource.manager,
  ) {
    return await this.tokenService.saveRefreshToken(
      userId,
      refreshToken,
      manager,
    );
  }

  /* ----------------------------------------------------
   * REGISTER
   * --------------------------------------------------*/
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmailWithPassword(
      registerDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      const user: UserResponseDto = await this.userService.createUser(
        registerDto,
        manager,
      );

      const { accessToken, refreshToken } = this.generateTokens(user);

      await this.storeRefreshToken(user.id, refreshToken, manager);

      return {
        user,
        accessToken,
        refreshToken,
      };
    });
  }

  /* ----------------------------------------------------
   * LOGIN
   * --------------------------------------------------*/
  async login(loginDto: LoginDto) {
    const user: UserWithPassword | null =
      await this.userService.findByEmailWithPassword(loginDto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await argon2.verify(user.password, loginDto.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = this.generateTokens(user);

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /* ----------------------------------------------------
   * REFRESH TOKEN
   * --------------------------------------------------*/
  async refresh({ refreshToken }: { refreshToken: string }) {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token required');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const tokenExists =
      await this.tokenService.findByRefreshToken(refreshToken);

    if (!tokenExists) {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }

    const { sub: userId, email, role } = payload;
    const newTokens = this.generateTokens({ id: userId, email, role });

    await this.storeRefreshToken(userId, newTokens.refreshToken);

    return newTokens;
  }

  /* ----------------------------------------------------
   * LOGOUT
   * --------------------------------------------------*/
  async logout({ refreshToken }: { refreshToken: string }) {
    const tokenExists =
      await this.tokenService.findByRefreshToken(refreshToken);

    if (!tokenExists) {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }
    await this.tokenService.deleteRefreshToken(refreshToken);

    return { message: 'Logged out successfully' };
  }

  /* ----------------------------------------------------
   * PROFILE
   * --------------------------------------------------*/
  async getProfile(userId: string) {
    return await this.userService.findByUserId(userId);
  }
}
