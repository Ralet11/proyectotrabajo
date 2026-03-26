import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('cloudinary-signature')
  createSignature(@Body() body: unknown) {
    return this.uploadsService.createSignedUpload(body);
  }
}

