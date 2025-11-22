import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FileEntity } from './entities/file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    CloudinaryModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const maxFileSize =
          configService.get<number>('MAX_FILE_SIZE') || 10 * 1024 * 1024; // Default: 10MB

        return {
          storage: memoryStorage(),
          limits: {
            fileSize: maxFileSize,
            files: 1, // Only allow single file upload
          },
          fileFilter: (req, file, cb) => {
            // Basic MIME type check (detailed validation in pipe)
            const allowedMimeTypes = [
              // Images
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/gif',
              'image/webp',
              'image/svg+xml',
              // Documents
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              // Text
              'text/plain',
              'text/csv',
              // Archives
              'application/zip',
              'application/x-zip-compressed',
              'application/x-rar-compressed',
              // Video
              'video/mp4',
              'video/mpeg',
              'video/quicktime',
              // Audio
              'audio/mpeg',
              'audio/mp3',
              'audio/wav',
            ];

            if (allowedMimeTypes.includes(file.mimetype)) {
              cb(null, true);
            } else {
              cb(
                new Error(
                  `File type "${file.mimetype}" is not allowed. Please upload a valid file type.`,
                ),
                false,
              );
            }
          },
        };
      },
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
