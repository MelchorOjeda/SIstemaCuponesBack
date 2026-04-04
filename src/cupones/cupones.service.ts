import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(private prisma: PrismaService) { }

  async generarCupon(createCuponDto: CreateCuponDto, ip: string) {
    const { id_cliente, id_sucursal } = createCuponDto;

    const ipsPermitidas = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
    const esAdmin = ipsPermitidas.includes(ip);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cuponPorIp = await this.prisma.cuponAsignado.findFirst({
      where: {
        ip_registro: ip,
        fecha_asignacion: { gte: hoy }
      }
    });

if (!esAdmin) {
    const cuponPorIp = await this.prisma.cuponAsignado.findFirst({
      where: {
        ip_registro: ip,
        fecha_asignacion: { gte: hoy }
      }
    });

    if (cuponPorIp) {
      throw new BadRequestException('Solo se permite una participación por dispositivo al día.');
    }
  }

    const previo = await this.prisma.cuponAsignado.findFirst({
      where: { id_cliente, id_sucursal_canje: id_sucursal }
    });
    if (previo) throw new BadRequestException('Ya generaste un cupón para esta sucursal.');

    const promosRelacionadas = await this.prisma.promocionSucursal.findMany({
      where: {
        id_sucursal: id_sucursal,
        promocion: { fecha_fin: { gt: new Date() } }
      },
      include: { promocion: true }
    });

    if (promosRelacionadas.length === 0) {
      throw new NotFoundException('No hay promociones activas para esta sucursal.');
    }

    const listaPromos = promosRelacionadas.map(pr => pr.promocion);

    let promoGanadora;
    const numAzar = Math.floor(Math.random() * 100) + 1;

    if (id_sucursal === 2 && numAzar === 100) {
      promoGanadora = listaPromos.find(p => p.nombre.includes('10%'));
    }

    if (!promoGanadora) {
      const normales = listaPromos.filter(p => !p.nombre.includes('10%'));
      promoGanadora = normales[Math.floor(Math.random() * normales.length)];
    }

    return this.prisma.cuponAsignado.create({
      data: {
        codigo_unico: `SQR${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        cliente: { connect: { id: id_cliente } },
        promocion: { connect: { id: promoGanadora.id } },
        sucursal: { connect: { id: id_sucursal } },
        ip_registro: ip,
      },
      include: { promocion: true }
    });
  }

  findAll() {
    return this.prisma.cuponAsignado.findMany({
      include: {
        cliente: true,
        promocion: true,
        sucursal: true
      },
      orderBy: { id: 'desc' }
    });
  }

  async update(id: number, updateCuponDto: UpdateCuponDto) {
    try {
      return await this.prisma.cuponAsignado.update({
        where: { id },
        data: updateCuponDto,
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar el cupón con ID ${id}`);
    }
  }

  async canjear(codigo: string, id_empleado: number) {
    const cupon = await this.prisma.cuponAsignado.findUnique({
      where: { codigo_unico: codigo }
    });

    if (!cupon || cupon.estado !== 'DISPONIBLE') {
      throw new BadRequestException('Cupón no válido o ya canjeado.');
    }

    return this.prisma.cuponAsignado.update({
      where: { codigo_unico: codigo },
      data: {
        estado: 'CANJEADO',
        fecha_canje: new Date(),
        id_empleado_canje: id_empleado
      }
    });
  }

}

