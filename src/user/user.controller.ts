import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from './enum/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jw.auth.guard';
import { UserService } from './user.service';
import { FindUserQueryDto } from './dto/find.user.query.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users', description: 'Get a paginated list of users with search, filter, and sort options. Admin only.' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  async getUsers(@Query() query: FindUserQueryDto) {
    return await this.userService.getAllUsers(query);
  }
}
