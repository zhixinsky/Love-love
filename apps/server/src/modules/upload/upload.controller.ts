import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UploadTokenDto } from './dto/upload-token.dto';
import { UploadService } from './upload.service';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const ext = file.originalname?.split('.').pop() || 'jpg';
    cb(null, `${randomUUID()}.${ext}`);
  },
});

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('token')
  getToken(
    @CurrentUser('userId') userId: string,
    @Body() dto: UploadTokenDto,
  ) {
    return this.uploadService.getToken(userId, dto.scene);
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(new BadRequestException('只能上传图片'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择文件');
    return this.uploadService.resolvePublicUrl(file.filename);
  }

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok =
          file.mimetype?.startsWith('audio/') ||
          file.mimetype === 'application/octet-stream';
        if (!ok) {
          return cb(new BadRequestException('只能上传语音'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadVoice(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('请选择文件');
    return this.uploadService.resolvePublicUrl(
      file.filename,
      `voice/${file.filename}`,
    );
  }
}
