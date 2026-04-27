import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { ClientesService } from 'src/clientes/clientes.service';
import { RegistroYCuponDto } from './dto/registro-y-cupon.dto';
import { VincularCuponDto } from './dto/vincular-cupon.dto';
import { CanjearCuponDto } from './dto/canjear-cupon.dto';

const IPS_BLANCAS = ['::1', '127.0.0.1', '192.168.1.41', '::ffff:127.0.0.1'];

@Injectable()
export class CuponesService {
  constructor(
    private prisma: PrismaService,
    private clientesService: ClientesService
  ) { }

  // ---------------------------------------------------------------------------
  // PASO 1: El Gancho — devuelve una promoción al azar SIN escribir en DB.
  // Valida la IP para el "early exit": si ya participó hoy, se rechaza aquí.
  // ---------------------------------------------------------------------------
  async obtenerSorteoInicial(idSucursal: number, ip: string) {
    if (!IPS_BLANCAS.includes(ip)) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const cuponPorIp = await this.prisma.cuponAsignado.findFirst({
        where: { ip_registro: ip, fecha_asignacion: { gte: hoy } },
      });
      if (cuponPorIp) {
        throw new BadRequestException('Ya participaste hoy. ¡Te esperamos mañana!');
      }
    }

    const promosRelacionadas = await this.prisma.promocionSucursal.findMany({
      where: {
        id_sucursal: idSucursal,
        promocion: { fecha_fin: { gt: new Date() } },
      },
      include: { promocion: true },
    });

    if (promosRelacionadas.length === 0) {
      throw new NotFoundException('No hay promociones activas para esta sucursal.');
    }

    const listaPromos = promosRelacionadas.map((pr) => pr.promocion);

    // Lógica de sorteo: sucursal 2 tiene 1/100 de obtener el descuento del 10%
    let promoGanadora;
    const numAzar = Math.floor(Math.random() * 100) + 1;
    if (idSucursal === 2 && numAzar === 100) {
      promoGanadora = listaPromos.find((p) => p.nombre.includes('10%'));
    }
    if (!promoGanadora) {
      const normales = listaPromos.filter((p) => !p.nombre.includes('10%'));
      promoGanadora = normales[Math.floor(Math.random() * normales.length)];
    }

    return {
      id_promocion: promoGanadora.id,
      nombre: promoGanadora.nombre,
      descripcion: promoGanadora.descripcion,
    };
  }

  // ---------------------------------------------------------------------------
  // PASO 3: La Entrega — recibe datos del lead + id_promocion del Paso 1.
  // Crea el cliente (upsert) y el cupón en una sola transacción.
  // ---------------------------------------------------------------------------
  async vincularRegistro(dto: VincularCuponDto, ip: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Segunda barrera de seguridad por IP
      if (!IPS_BLANCAS.includes(ip)) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const cuponPorIp = await tx.cuponAsignado.findFirst({
          where: { ip_registro: ip, fecha_asignacion: { gte: hoy } },
        });
        if (cuponPorIp) {
          throw new BadRequestException('Solo una participación por dispositivo al día.');
        }
      }

      // Verificar que la promoción enviada pertenece a la sucursal
      const relacionPromo = await tx.promocionSucursal.findFirst({
        where: {
          id_sucursal: dto.id_sucursal,
          id_promocion: dto.id_promocion,
          promocion: { fecha_fin: { gt: new Date() } },
        },
        include: { promocion: true },
      });

      if (!relacionPromo) {
        throw new BadRequestException('La promoción indicada no es válida para esta sucursal.');
      }

      // Upsert del cliente (mismo patrón que el flujo anterior)
      const cliente = await this.clientesService.upsertCliente(dto, tx);

      // Verificar que el cliente no tenga ya un cupón para esta sucursal
      const previo = await tx.cuponAsignado.findFirst({
        where: { id_cliente: cliente.id, id_sucursal_canje: dto.id_sucursal },
      });
      if (previo) {
        throw new BadRequestException('Ya generaste un cupón para esta sucursal.');
      }

      const cupon = await tx.cuponAsignado.create({
        data: {
          codigo_unico: `CQR-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          id_cliente: cliente.id,
          id_promocion: dto.id_promocion,
          id_sucursal_canje: dto.id_sucursal,
          ip_registro: ip,
        },
        include: { promocion: true },
      });

      return {
        codigo_unico: cupon.codigo_unico,
        vigencia: cupon.promocion.fecha_fin,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Método legacy mantenido por compatibilidad con encuestas u otros flujos
  // ---------------------------------------------------------------------------
  async registrarYGenerar(dto: RegistroYCuponDto, ip: string) {
    return await this.prisma.$transaction(async (tx) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const cuponPorIp = await tx.cuponAsignado.findFirst({
        where: { ip_registro: ip, fecha_asignacion: { gte: hoy } },
      });

      if (cuponPorIp && !IPS_BLANCAS.includes(ip)) {
        throw new BadRequestException('Solo una participación por dispositivo al día.');
      }

      const cliente = await this.clientesService.upsertCliente(dto, tx);

      const previo = await tx.cuponAsignado.findFirst({
        where: { id_cliente: cliente.id, id_sucursal_canje: dto.id_sucursal },
      });
      if (previo) throw new BadRequestException('Ya generaste un cupón para esta sucursal.');

      const promosRelacionadas = await tx.promocionSucursal.findMany({
        where: {
          id_sucursal: dto.id_sucursal,
          promocion: { fecha_fin: { gt: new Date() } },
        },
        include: { promocion: true },
      });

      if (promosRelacionadas.length === 0) {
        throw new NotFoundException('No hay promociones activas.');
      }

      const listaPromos = promosRelacionadas.map((pr) => pr.promocion);
      let promoGanadora;
      const numAzar = Math.floor(Math.random() * 100) + 1;

      if (dto.id_sucursal === 2 && numAzar === 100) {
        promoGanadora = listaPromos.find((p) => p.nombre.includes('10%'));
      }
      if (!promoGanadora) {
        const normales = listaPromos.filter((p) => !p.nombre.includes('10%'));
        promoGanadora = normales[Math.floor(Math.random() * normales.length)];
      }

      return await tx.cuponAsignado.create({
        data: {
          codigo_unico: `CQR-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          id_cliente: cliente.id,
          id_promocion: promoGanadora.id,
          id_sucursal_canje: dto.id_sucursal,
          ip_registro: ip,
        },
        include: { promocion: true },
      });
    });
  }

  findAll() {
    return this.prisma.cuponAsignado.findMany({
      include: {
        cliente: true,
        promocion: {
          include: {
            campania: true,
          },
        },
        sucursal: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async update(id: number, updateCuponDto: UpdateCuponDto) {
    try {
      return await this.prisma.cuponAsignado.update({
        where: { id },
        data: updateCuponDto,
      });
    } catch {
      throw new Error(`No se pudo encontrar el cupón con ID ${id}`);
    }
  }

  async obtenerInfoParaCanje(codigo: string) {
    const cupon = await this.prisma.cuponAsignado.findUnique({
      where: { codigo_unico: codigo },
      include: {
        cliente: true,
        promocion: true,
      },
    });

    if (!cupon) {
      throw new NotFoundException('Este cupón no existe.');
    }

    if (cupon.estado !== 'DISPONIBLE') {
      throw new BadRequestException(
        `Este cupón ya no está disponible (Estado: ${cupon.estado}).`
      );
    }

    return {
      promocionNombre: cupon.promocion.nombre,
      promocionDescripcion: cupon.promocion.descripcion,
      clienteNombre: cupon.cliente.nombre,
      fechaObtencion: cupon.fecha_asignacion,
      estado: cupon.estado,
    };
  }

  async canjear(dto: CanjearCuponDto) {
    const infoCupon = await this.obtenerInfoParaCanje(dto.codigo);
    void infoCupon; // ya lanza si no es válido

    const relacion = await this.prisma.empleadoSucursal.findUnique({
      where: {
        id_empleado_id_sucursal: {
          id_empleado: dto.id_empleado,
          id_sucursal: dto.id_sucursal,
        },
      },
    });

    if (!relacion) {
      throw new BadRequestException('El empleado no está asignado a esta sucursal.');
    }

    return await this.prisma.cuponAsignado.update({
      where: { codigo_unico: dto.codigo },
      data: {
        estado: 'CANJEADO',
        fecha_canje: new Date(),
        id_empleado_canje: dto.id_empleado,
      },
    });
  }

  async generarCuponEspecial(clienteId: number, promocionId: number, tx: any) {
    const codigo = `SQR${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return await tx.cuponAsignado.create({
      data: {
        codigo_unico: codigo,
        id_cliente: clienteId,
        id_promocion: promocionId,
        estado: 'DISPONIBLE',
      },
    });
  }

  // ---------------------------------------------------------------------------
  // ADMIN: Soft-delete — cambia estado a CANCELADO
  // ---------------------------------------------------------------------------
  async remove(id: number) {
    try {
      return await this.prisma.cuponAsignado.update({
        where: { id },
        data: { estado: 'CANCELADO' },
      });
    } catch {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }
  }

  async reactivate(id: number) {
    try {
      return await this.prisma.cuponAsignado.update({
        where: { id },
        data: { estado: 'DISPONIBLE' },
      });
    } catch {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }
  }

  // ---------------------------------------------------------------------------
  // ADMIN: Estadísticas de cupones generados vs canjeados por día (30 días)
  // ---------------------------------------------------------------------------
  async estadisticasPorDia() {
    const cupones = await this.prisma.cuponAsignado.findMany({
      where: {
        fecha_asignacion: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        fecha_asignacion: true,
        fecha_canje: true,
        estado: true,
      },
      orderBy: { fecha_asignacion: 'asc' },
    });

    // Agrupar por fecha (YYYY-MM-DD)
    const mapa: Record<string, { generados: number; canjeados: number }> = {};
    for (const c of cupones) {
      const fecha = c.fecha_asignacion.toISOString().slice(0, 10);
      if (!mapa[fecha]) mapa[fecha] = { generados: 0, canjeados: 0 };
      mapa[fecha].generados++;
      if (c.estado === 'CANJEADO') mapa[fecha].canjeados++;
    }

    return Object.entries(mapa).map(([fecha, vals]) => ({ fecha, ...vals }));
  }
}

