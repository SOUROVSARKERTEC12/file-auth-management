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
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { ConfigService } from '@nestjs/config';

@ApiTags('files')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  private readonly fileValidationPipe: FileValidationPipe;

  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {
    // Initialize file validation pipe with config
    const maxFileSize =
      this.configService.get<number>('MAX_FILE_SIZE') ||
      10 * 1024 * 1024; // Default: 10MB
    this.fileValidationPipe = new FileValidationPipe({
      maxSize: maxFileSize,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Upload a file to Cloudinary. The file will be associated with the authenticated user. Maximum file size: 10MB (configurable via MAX_FILE_SIZE env variable). Allowed file types: images (jpg, png, gif, webp, svg), documents (pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv), archives (zip, rar), videos (mp4, mpeg, mov), and audio (mp3, wav).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'File to upload (max 10MB). Allowed types: images, documents, archives, videos, audio',
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
  @ApiBadRequestResponse({
    description:
      'File validation failed: file is required, file size exceeds limit, or file type is not allowed',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async uploadFile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file using the validation pipe
    this.fileValidationPipe.transform(file);

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
