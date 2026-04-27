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

  async findAll() {
    return this.prisma.dynamicQR.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(id: string) {
    const qr = await this.prisma.dynamicQR.findUnique({
      where: { id },
      include: {
        visits: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Últimas 100 visitas para la tabla
        },
      },
    });

    if (!qr) throw new BadRequestException('QR no encontrado');

    // Agrupar visitas por día para el gráfico (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chartDataRaw = await this.prisma.qRVisit.groupBy({
      by: ['createdAt'],
      where: {
        qrId: id,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Procesar datos para que el frontend los lea fácil (YYYY-MM-DD)
    const statsByDate = chartDataRaw.reduce((acc, curr) => {
      const date = curr.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(statsByDate).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      ...qr,
      chartData,
    };
  }

  async findTarget(slug: string, userAgent: string, ip: string) {
    const link = await this.prisma.dynamicQR.findUnique({ where: { slug } });
    if (!link) throw new BadRequestException('QR no encontrado');

    // Obtener ubicación aproximada
    const location = await this.getLocation(ip);

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
          city: location?.city,
          region: location?.region,
          country: location?.country,
          lat: location?.lat,
          long: location?.long,
        },
      }),
    ]);

    return link.targetUrl;
  }

  private async getLocation(ip: string) {
    try {
      // Evitar llamadas para localhost
      if (ip === '::1' || ip === '127.0.0.1' || !ip) return null;
      
      // En caso de que la IP venga de un proxy (x-forwarded-for)
      const cleanIp = ip.split(',')[0].trim();
      
      const response = await fetch(`http://ip-api.com/json/${cleanIp}`);
      const data = (await response.json()) as any;
      
      if (data.status === 'success') {
        return {
          city: data.city,
          region: data.regionName,
          country: data.country,
          lat: data.lat,
          long: data.lon,
        };
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
    return null;
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