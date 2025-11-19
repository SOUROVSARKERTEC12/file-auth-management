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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existUser = await this.userService.findByEmailWithPassword(
      registerDto.email,
    );

    if (existUser) {
      throw new BadRequestException('Email already exists');
    }

    return this.dataSource.transaction(async (manager) => {
      // 1️⃣ Create user inside transaction
      const user = await this.userService.createUser(registerDto, manager);

      // 2️⃣ Generate access token (valid 15 minutes)
      const accessToken = this.jwtService.sign({
        id: user.id,
        email: user.email,
      });

      // 3️⃣ Generate refresh token (valid 30 days)
      const refreshToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN as number | undefined },
      );

      await this.tokenService.saveRefreshToken(user.id, refreshToken, manager);

      return {
        user,
        accessToken,
        refreshToken,
      };
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmailWithPassword(loginDto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2️⃣ Verify password
    const isValid = await argon2.verify(user.password, loginDto.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    /// Generate tokens
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN as number | undefined },
    );

    await this.tokenService.saveRefreshToken(
      user.id,
      refreshToken,
      this.dataSource.manager,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenDto: { refreshToken: string }) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    // 1️⃣ Decode token (do NOT trust it yet)
    let payload: { sub: string; email: string; iat: number; exp: number };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (e) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const userId = payload.sub;

    // 2️⃣ Check if refresh token exists in DB
    const tokenExists =
      await this.tokenService.findByRefreshToken(refreshToken);

    if (!tokenExists) {
      throw new ForbiddenException('Refresh token is invalid or expired');
    }

    // 3️⃣ Generate new tokens (token rotation)
    const newAccessToken = this.jwtService.sign({
      sub: userId,
      email: payload.email,
    });

    const newRefreshToken = this.jwtService.sign(
      { sub: userId, email: payload.email },
      { expiresIn: process.env.REFRESH_JWT_EXPIRES_IN as number | undefined },
    );

    // 4️⃣ Replace old refresh token in DB
    await this.tokenService.saveRefreshToken(
      userId,
      newRefreshToken,
      this.dataSource.manager,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenDto: { refreshToken: string }) {
    return this.tokenService.deleteRefreshToken(refreshTokenDto.refreshToken);
  }

  async getProfile(userId: string) {
    return this.userService.findByUserId(userId);
  }
}
