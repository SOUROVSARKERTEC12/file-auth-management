import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create.file.dto';
import { UpdateFileDto } from './dto/update.file.dto';
import { JwtAuthGuard } from 'src/auth/guard/jw.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/enum/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    dto.userId = req.user.sub;
    return this.fileService.create(file, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllFiles() {
    return this.fileService.findAll();
  }

  @Get(':id')
  async getFileById(@Req() req, @Param('id') id: string) {
    return this.fileService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async updateFile(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateFileDto,
  ) {
    return this.fileService.update(id, { ...dto, userId: req.user.sub });
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteFile(@Req() req, @Param('id') id: string) {
    return this.fileService.remove(id, req.user.sub);
  }
}
