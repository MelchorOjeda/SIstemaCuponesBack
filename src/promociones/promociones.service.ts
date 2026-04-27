import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
  constructor(private prisma: PrismaService) { }

  create(createPromocionDto: CreatePromocionDto) {
    const { sucursales, ...data } = createPromocionDto;
    return this.prisma.promocion.create({
      data: {
        ...data,
        sucursales: sucursales ? {
          create: sucursales.map(id_sucursal => ({ id_sucursal }))
        } : undefined
      },
      include: { sucursales: true, campania: true }
    });
  }

  findAll() {
    return this.prisma.promocion.findMany({
      include: {
        sucursales: { include: { sucursal: true } },
        campania: true,
        _count: { select: { cupones_emitidos: true } }
      },
      orderBy: { id: 'desc' }
    });
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    const { sucursales, ...data } = updatePromocionDto;
    try {
      return await this.prisma.promocion.update({
        where: { id },
        data: {
          ...data,
          sucursales: sucursales ? {
            deleteMany: {},
            create: sucursales.map(id_sucursal => ({ id_sucursal }))
          } : undefined
        },
        include: { sucursales: true, campania: true }
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar o actualizar la promoción con ID ${id}`);
    }
  }

  async findOne(id: number) {
    const promo = await this.prisma.promocion.findUnique({
      where: { id },
      include: { sucursales: true, campania: true }
    });
    if (!promo) throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    return promo;
  }

  async remove(id: number) {
    // Soft-delete: Usamos el nuevo campo estado
    try {
      return await this.prisma.promocion.update({
        where: { id },
        data: {
          estado: 'DESACTIVADA',
          fecha_fin: new Date('2000-01-01T00:00:00Z') // Mantenemos compatibilidad con lógica antigua
        },
      });
    } catch {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }
  }
}