import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/auth/dto/register.user.dto';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async createUser(registerDto: RegisterDto, manager) {
    registerDto.password = await argon2.hash(registerDto.password);

    const newUser = manager.create(User, registerDto);

    const saved = await manager.save(User, newUser);

    const { password, ...userWithoutPassword } = saved;
    return userWithoutPassword;
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  async findByUserId(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
