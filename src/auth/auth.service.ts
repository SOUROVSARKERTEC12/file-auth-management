import {
  BadRequestException,
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
}
