import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {
    mkdirSync(join(process.cwd(), 'uploads'), { recursive: true });
  }

  getToken(userId: string, scene: string) {
    const key = `${scene}/${userId}/${randomUUID()}`;
    const base = this.getPublicBase();
    return {
      uploadUrl: `${base}/api/upload/image`,
      key,
      publicUrl: `${base}/uploads/`,
      scene,
      storage: this.getCloudStorageType(),
    };
  }

  async resolvePublicUrl(localFilename: string, sceneKey?: string) {
    const key = sceneKey || `uploads/${localFilename}`;

    if (this.isOssEnabled()) {
      try {
        return await this.uploadLocalFileToOss(localFilename, key);
      } catch (err) {
        this.logger.error('OSS upload failed, fallback to local', err);
      }
    } else if (this.isCosEnabled()) {
      try {
        return await this.uploadLocalFileToCos(localFilename, key);
      } catch (err) {
        this.logger.error('COS upload failed, fallback to local', err);
      }
    }

    return this.buildPublicUrl(localFilename);
  }

  buildPublicUrl(filename: string) {
    const cdn =
      this.config.get<string>('OSS_CDN_BASE') ||
      this.config.get<string>('COS_CDN_BASE');
    if (cdn) {
      const url = `${cdn.replace(/\/$/, '')}/uploads/${filename}`;
      return { url, fileUrl: url };
    }
    const base = this.getPublicBase();
    const url = `${base}/uploads/${filename}`;
    return { url, fileUrl: url };
  }

  private getCloudStorageType(): 'oss' | 'cos' | 'local' {
    if (this.isOssEnabled()) return 'oss';
    if (this.isCosEnabled()) return 'cos';
    return 'local';
  }

  /** 阿里云 OSS */
  private isOssEnabled() {
    return Boolean(
      this.config.get('OSS_ACCESS_KEY_ID') &&
        this.config.get('OSS_ACCESS_KEY_SECRET') &&
        this.config.get('OSS_BUCKET') &&
        (this.config.get('OSS_REGION') || this.config.get('OSS_ENDPOINT')),
    );
  }

  /** 腾讯云 COS（可选，与 OSS 二选一） */
  private isCosEnabled() {
    return Boolean(
      this.config.get('COS_SECRET_ID') &&
        this.config.get('COS_SECRET_KEY') &&
        this.config.get('COS_BUCKET') &&
        this.config.get('COS_REGION'),
    );
  }

  private async uploadLocalFileToOss(filename: string, key: string) {
    const OSS = (await import('ali-oss')).default;
    const region = this.config.get<string>('OSS_REGION')!;
    const client = new OSS({
      region,
      accessKeyId: this.config.get<string>('OSS_ACCESS_KEY_ID')!,
      accessKeySecret: this.config.get<string>('OSS_ACCESS_KEY_SECRET')!,
      bucket: this.config.get<string>('OSS_BUCKET')!,
      endpoint: this.config.get<string>('OSS_ENDPOINT') || undefined,
    });
    const filePath = join(process.cwd(), 'uploads', filename);
    await client.put(key, createReadStream(filePath));

    const url = this.buildOssPublicUrl(key);
    return { url, fileUrl: url };
  }

  private buildOssPublicUrl(key: string) {
    const cdn = this.config.get<string>('OSS_CDN_BASE');
    if (cdn) return `${cdn.replace(/\/$/, '')}/${key}`;

    const bucket = this.config.get<string>('OSS_BUCKET');
    const region = this.config.get<string>('OSS_REGION');
    return `https://${bucket}.${region}.aliyuncs.com/${key}`;
  }

  private async uploadLocalFileToCos(filename: string, key: string) {
    const COS = (await import('cos-nodejs-sdk-v5')).default;
    const cos = new COS({
      SecretId: this.config.get<string>('COS_SECRET_ID'),
      SecretKey: this.config.get<string>('COS_SECRET_KEY'),
    });
    const bucket = this.config.get<string>('COS_BUCKET');
    const region = this.config.get<string>('COS_REGION');
    const filePath = join(process.cwd(), 'uploads', filename);

    await new Promise<void>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket!,
          Region: region!,
          Key: key,
          Body: createReadStream(filePath),
        },
        (err) => (err ? reject(err) : resolve()),
      );
    });

    const cdn = this.config.get<string>('COS_CDN_BASE');
    const url = cdn
      ? `${cdn.replace(/\/$/, '')}/${key}`
      : `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
    return { url, fileUrl: url };
  }

  private getPublicBase() {
    const configured = this.config.get<string>('PUBLIC_HOST');
    if (configured) return configured.replace(/\/$/, '');
    const port = this.config.get<string>('PORT') || '3000';
    return `http://127.0.0.1:${port}`;
  }
}
