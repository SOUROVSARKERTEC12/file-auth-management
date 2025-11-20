import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import { CreateFileDto } from './dto/create.file.dto';
import { UpdateFileDto } from './dto/update.file.dto';
import { FileResponseDto } from './dto/file.response.dto';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { UploadResult } from './interfaces/upoload.result.interface';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // -----------------------------------------------------------------------
  // Upload File + Save Metadata
  // -----------------------------------------------------------------------
  async create(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
  ): Promise<FileResponseDto> {
    const { folder = 'nestjs-uploads', filename } = createFileDto;

    // Upload to Cloudinary
    const uploadResult: UploadResult =
      (await this.cloudinaryService.uploadImage(file, folder)) as UploadResult;

    // console.log('Upload Result:', uploadResult);
    const newFile = this.fileRepository.create({
      filename,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      size: uploadResult.bytes,
      folder: folder ?? '',
      userId: createFileDto.userId,
    });

    const saved = await this.fileRepository.save(newFile);

    return saved as FileResponseDto;
  }

  // -----------------------------------------------------------------------
  // Find All Files
  // -----------------------------------------------------------------------
  async findAll(): Promise<FileResponseDto[]> {
    const files = await this.fileRepository.find();
    return files.map((f) => f as FileResponseDto);
  }

  // -----------------------------------------------------------------------
  // Find One File
  // -----------------------------------------------------------------------
  async findOne(id: string, userId: string): Promise<FileResponseDto> {
    const file = await this.fileRepository.findOne({ where: { id, userId } });
    if (!file) throw new NotFoundException('File not found');
    return file as FileResponseDto;
  }

  // -----------------------------------------------------------------------
  // Update File Metadata (filename, folder)
  // -----------------------------------------------------------------------
  async update(
    id: string,
    updateFileDto: UpdateFileDto,
  ): Promise<FileResponseDto> {
    const file = await this.fileRepository.findOne({
      where: { id, userId: updateFileDto.userId },
    });
    if (!file) throw new NotFoundException('File not found');

    Object.assign(file, updateFileDto);
    const updated = await this.fileRepository.save(file);
    return updated as FileResponseDto;
  }

  // -----------------------------------------------------------------------
  // Delete File (Cloudinary + DB)
  // -----------------------------------------------------------------------
  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const file = await this.fileRepository.findOne({ where: { id, userId } });
    if (!file) throw new NotFoundException('File not found');

    // Delete from Cloudinary
    const cloudinaryResult = await this.cloudinaryService.deleteImage(
      file.publicId,
    );
    if (!cloudinaryResult.success) return { success: false };

    // Delete from DB
    await this.fileRepository.delete(id);
    return { success: true };
  }
}
