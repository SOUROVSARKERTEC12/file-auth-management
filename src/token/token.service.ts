import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async saveRefreshToken(userId: string, refreshToken: string, manager) {
    const tokenRepo = manager.getRepository(Token);

    await tokenRepo.delete({ userId });

    const token = tokenRepo.create({
      userId,
      token: refreshToken,
    });

    return tokenRepo.save(token);
  }

  async deleteRefreshToken(refreshToken: string) {
    return this.tokenRepository.delete({ token: refreshToken });
  }

  async findByRefreshToken(refreshToken: string): Promise<Token | null> {
    return this.tokenRepository.findOneBy({ token: refreshToken });
  }
}
