import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQrDynamicDto } from './dto/create-qr-dynamic.dto';
import { createCanvas, loadImage } from 'canvas';
import * as QRCode from 'qrcode';

@Injectable()
export class QrDynamicService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateQrDynamicDto) {
    const exists = await this.prisma.dynamicQR.findUnique({
      where: { slug: createDto.slug },
    });
    if (exists) throw new BadRequestException('El slug ya existe');
    return this.prisma.dynamicQR.create({ data: createDto });
  }

  async findTarget(slug: string, userAgent: string, ip: string) {
    const link = await this.prisma.dynamicQR.findUnique({ where: { slug } });
    if (!link) throw new BadRequestException('QR no encontrado');

    await this.prisma.$transaction([
      this.prisma.dynamicQR.update({
        where: { id: link.id },
        data: { visitCount: { increment: 1 } },
      }),
      this.prisma.qRVisit.create({
        data: {
          qrId: link.id,
          userAgent,
          ip,
        },
      }),
    ]);

    return link.targetUrl;
  }

  async generateImage(slug: string) {
    const baseUrl = process.env.BASE_URL_QR || 'http://localhost:3000';

    const redirectUrl = `${baseUrl}/qr-dynamic/r/${slug}`;

    const canvas = createCanvas(600, 600);

    await QRCode.toCanvas(canvas, redirectUrl, {
      errorCorrectionLevel: 'H',
      width: 600,
      margin: 4,
      color: {
        dark: '#73385c', 
        light: '#FFFFFF', 
      },
    });

    const ctx = canvas.getContext('2d');

    try {
      const logo = await loadImage('assets/moraMermelada.png');
      const logoSize = 135; // Un poquito más grande para que luzca
      const x = (600 - logoSize) / 2;
      const y = (600 - logoSize) / 2;

      // Círculo blanco de fondo (da el efecto de tu imagen de referencia)
      ctx.beginPath();
      ctx.arc(300, 300, (logoSize / 2) + 15, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Dibujar el logo de la mora
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    } catch (e: any) {
      console.log('Error cargando logo:', e.message);
    }

    return canvas.toDataURL();
  }
}