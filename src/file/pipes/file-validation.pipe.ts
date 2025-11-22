import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedMimeTypes: string[];
  private readonly allowedExtensions: string[];

  constructor(options: FileValidationOptions = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // Default: 10MB
    this.allowedMimeTypes =
      options.allowedMimeTypes ||
      [
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
    this.allowedExtensions =
      options.allowedExtensions ||
      [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'csv',
        'zip',
        'rar',
        'mp4',
        'mpeg',
        'mov',
        'mp3',
        'wav',
      ];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check file size
    if (file.size > this.maxSize) {
      const maxSizeMB = (this.maxSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${maxSizeMB}MB. Your file is ${fileSizeMB}MB.`,
      );
    }

    // Check MIME type
    if (
      this.allowedMimeTypes.length > 0 &&
      !this.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check file extension
    if (file.originalname) {
      const extension = file.originalname
        .split('.')
        .pop()
        ?.toLowerCase();
      if (
        extension &&
        this.allowedExtensions.length > 0 &&
        !this.allowedExtensions.includes(extension)
      ) {
        throw new BadRequestException(
          `File extension ".${extension}" is not allowed. Allowed extensions: ${this.allowedExtensions.map((ext) => `.${ext}`).join(', ')}`,
        );
      }
    }

    return file;
  }
}

