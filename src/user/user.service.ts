import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as argon2 from 'argon2';

import { User } from './entity/user.entity';
import { RegisterDto } from 'src/auth/dto/register.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { FindUserQueryDto } from './dto/find.user.query.dto';
import { PaginationResponse } from 'src/common/interfaces/pagination.response.interface';


@Injectable()
export class UserService {
  // Track user-related cache keys only
  private userCacheKeys = new Set<string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // --------------------------------------------------------------------------
  // Create User
  // --------------------------------------------------------------------------
  async createUser(
    registerDto: RegisterDto,
    manager: EntityManager,
  ): Promise<UserResponseDto> {
    registerDto.password = await argon2.hash(registerDto.password);

    const user = manager.create(User, registerDto);
    const saved = await manager.save(User, user);

    await this.invalidateUserCache();

    const { password, ...data } = saved;
    return data as UserResponseDto;
  }

  // --------------------------------------------------------------------------
  // Get user with password (login)
  // --------------------------------------------------------------------------
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'role', 'password'],
    });
  }

  // --------------------------------------------------------------------------
  // Get user by ID (without password)
  // --------------------------------------------------------------------------
  async findByUserId(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['token'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.token)
      throw new ForbiddenException('Token is invalid or expired');

    const { password, ...data } = user;
    return data as UserResponseDto;
  }

  // --------------------------------------------------------------------------
  // Get paginated users (with search, filter, sorting + cache)
  // --------------------------------------------------------------------------
  async getAllUsers(
    query: FindUserQueryDto,
  ): Promise<PaginationResponse<UserResponseDto>> {
    const cacheKey = `users:${JSON.stringify(query)}`;
    this.userCacheKeys.add(cacheKey);

    const cached = await this.cacheManager.get<PaginationResponse<UserResponseDto>>(cacheKey);
    if (cached) return cached;

    const {
      page = 1,
      limit = 10,
      search,
      email,
      role,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    // ----------------------------------------------------------------------
    // Filters
    // ----------------------------------------------------------------------
    if (search) {
      qb.andWhere(
        '(user.firstName LIKE :s OR user.lastName LIKE :s OR user.email LIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (email) qb.andWhere('user.email = :email', { email });
    if (role) qb.andWhere('user.role = :role', { role });

    // ----------------------------------------------------------------------
    // Pagination
    // ----------------------------------------------------------------------
    qb.skip((page - 1) * limit).take(limit);

    // ----------------------------------------------------------------------
    // Sorting
    // ----------------------------------------------------------------------
    qb.orderBy(`user.${sortBy}`, order);

    const [items, total] = await qb.getManyAndCount();

    const sanitized = items.map(({ password, ...u }) => u as UserResponseDto);

    const response: PaginationResponse<UserResponseDto> = {
      data: sanitized,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cacheManager.set(cacheKey, response, 60000);

    return response;
  }

  // --------------------------------------------------------------------------
  // Invalidate only user list cache
  // --------------------------------------------------------------------------
  private async invalidateUserCache() {
    for (const key of this.userCacheKeys) {
      await this.cacheManager.del(key);
    }
    this.userCacheKeys.clear();
  }
}
