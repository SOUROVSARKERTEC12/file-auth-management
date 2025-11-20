import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof Cloudinary) {}

  // ---------------------------------------------------------------------
  // Upload Image (buffer)
  // ---------------------------------------------------------------------
  async uploadImage(file: Express.Multer.File, folder: string) {
  
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  // ---------------------------------------------------------------------
  // Delete Image by Public ID
  // ---------------------------------------------------------------------
  async deleteImage(
    publicId: string,
  ): Promise<{ success: boolean; result: string }> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);

      return {
        success: result.result === 'ok',
        result,
      };
    } catch (error) {
      return {
        success: false,
        result: error,
      };
    }
  }
}
