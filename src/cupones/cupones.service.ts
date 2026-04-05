import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { ClientesService } from 'src/clientes/clientes.service';
import { RegistroYCuponDto } from './dto/registro-y-cupon.dto';

@Injectable()
export class CuponesService {
  constructor(
    private prisma: PrismaService,
    private clientesService: ClientesService
  ) { }

  async registrarYGenerar(dto: RegistroYCuponDto, ip: string) {
    return await this.prisma.$transaction(async (tx) => {

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const cuponPorIp = await tx.cuponAsignado.findFirst({
        where: { ip_registro: ip, fecha_asignacion: { gte: hoy } }
      });

      if (cuponPorIp && !['::1', '127.0.0.1', '192.168.1.41', '::ffff:127.0.0.1'].includes(ip)) {
        throw new BadRequestException('Solo una participación por dispositivo al día.');
      }

      const cliente = await this.clientesService.upsertCliente(dto, tx);

      const previo = await tx.cuponAsignado.findFirst({
        where: { id_cliente: cliente.id, id_sucursal_canje: dto.id_sucursal }
      });
      if (previo) throw new BadRequestException('Ya generaste un cupón para esta sucursal.');

      const promosRelacionadas = await tx.promocionSucursal.findMany({
        where: {
          id_sucursal: dto.id_sucursal,
          promocion: { fecha_fin: { gt: new Date() } }
        },
        include: { promocion: true }
      });

      if (promosRelacionadas.length === 0) {
        throw new NotFoundException('No hay promociones activas.');
      }

      const listaPromos = promosRelacionadas.map(pr => pr.promocion);
      let promoGanadora;
      const numAzar = Math.floor(Math.random() * 100) + 1;

      if (dto.id_sucursal === 2 && numAzar === 100) {
        promoGanadora = listaPromos.find(p => p.nombre.includes('10%'));
      }

      if (!promoGanadora) {
        const normales = listaPromos.filter(p => !p.nombre.includes('10%'));
        promoGanadora = normales[Math.floor(Math.random() * normales.length)];
      }

      return await tx.cuponAsignado.create({
        data: {
          codigo_unico: `SQR${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          id_cliente: cliente.id,
          id_promocion: promoGanadora.id,
          id_sucursal_canje: dto.id_sucursal,
          ip_registro: ip,
        },
        include: { promocion: true }
      });
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

