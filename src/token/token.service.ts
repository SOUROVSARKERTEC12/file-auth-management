import { Injectable } from '@nestjs/common';
import { Token } from './entity/token.entity';

@Injectable()
export class TokenService {
  async saveRefreshToken(userId: string, refreshToken: string, manager) {
    const tokenRepo = manager.getRepository(Token);

    // 1️⃣ Delete previous refresh token(s)
    await tokenRepo.delete({ userId });

    // 2️⃣ Create new token
    const token = tokenRepo.create({
      userId,
      token: refreshToken,
    });

    // 3️⃣ Save inside the same transaction
    return tokenRepo.save(token);
  }
}
