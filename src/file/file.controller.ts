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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { CreateFileDto } from './dto/create.file.dto';
import { UpdateFileDto } from './dto/update.file.dto';
import { JwtAuthGuard } from 'src/auth/guard/jw.auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/user/enum/role.enum';

@ApiTags('files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file', description: 'Upload a file to Cloudinary. The file will be associated with the authenticated user.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        filename: {
          type: 'string',
          example: 'my-document.pdf',
          description: 'Name of the file',
        },
        folder: {
          type: 'string',
          example: 'nestjs-uploads',
          description: 'Folder path in Cloudinary (optional)',
        },
      },
      required: ['file', 'filename'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiBadRequestResponse({ description: 'File is required or validation failed' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
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
  @ApiOperation({ summary: 'Get all files', description: 'Get a list of all files. Admin only.' })
  @ApiResponse({ status: 200, description: 'List of all files retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  async getAllFiles() {
    return this.fileService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID', description: 'Get file details by ID. Users can only access their own files.' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  async getFileById(@Req() req, @Param('id') id: string) {
    return this.fileService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata', description: 'Update file metadata (filename, folder). Users can only update their own files.' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiBody({ type: UpdateFileDto })
  @ApiResponse({ status: 200, description: 'File updated successfully' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
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
  @ApiOperation({ summary: 'Delete a file', description: 'Delete a file from Cloudinary and database. Admin only.' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  async deleteFile(@Req() req, @Param('id') id: string) {
    return this.fileService.remove(id, req.user.sub);
  }
}
