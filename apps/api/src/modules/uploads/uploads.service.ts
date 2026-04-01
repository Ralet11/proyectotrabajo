import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { z } from 'zod';

import { API_ENV } from '../../common/env.module';

const uploadSignatureSchema = z.object({
  folder: z.string().trim().min(1).max(120).default('professionals'),
});

@Injectable()
export class UploadsService {
  constructor(@Inject(API_ENV) private readonly env: Record<string, string>) {}

  createSignedUpload(payload: unknown) {
    const input = uploadSignatureSchema.parse(payload ?? {});

    if (
      !this.env.CLOUDINARY_CLOUD_NAME ||
      !this.env.CLOUDINARY_API_KEY ||
      !this.env.CLOUDINARY_API_SECRET
    ) {
      throw new BadRequestException('Cloudinary credentials are not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `oficios/${input.folder}`;
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${this.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');

    return {
      cloudName: this.env.CLOUDINARY_CLOUD_NAME,
      apiKey: this.env.CLOUDINARY_API_KEY,
      folder,
      timestamp,
      signature,
    };
  }
}

