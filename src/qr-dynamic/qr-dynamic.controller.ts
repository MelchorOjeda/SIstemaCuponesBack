import { Controller, Get, Post, Body, Param, Res, Redirect, Headers, Ip } from '@nestjs/common';
import { QrDynamicService } from './qr-dynamic.service';
import { CreateQrDynamicDto } from './dto/create-qr-dynamic.dto';
import type { Response } from 'express';

@Controller('qr-dynamic')
export class QrDynamicController {
  constructor(private readonly qrService: QrDynamicService) { }

  @Post()
  async create(@Body() createDto: CreateQrDynamicDto) {
    return this.qrService.create(createDto);
  }

  @Get('view/:slug')
  async viewQr(@Param('slug') slug: string) {
    const base64Image = await this.qrService.generateImage(slug);
    return { qr: base64Image };
  }

  @Get('r/:slug')
  async redirect(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string                          
  ) {
    const target = await this.qrService.findTarget(slug, userAgent, ip);
    return res.redirect(target);
  }
}