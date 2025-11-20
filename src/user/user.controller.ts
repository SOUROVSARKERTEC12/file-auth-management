import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from './enum/role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jw.auth.guard';
import { UserService } from './user.service';
import { FindUserQueryDto } from './dto/find.user.query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Roles(UserRole.ADMIN)
  async getUsers(@Query() query: FindUserQueryDto) {
    return await this.userService.getAllUsers(query);
  }
}
