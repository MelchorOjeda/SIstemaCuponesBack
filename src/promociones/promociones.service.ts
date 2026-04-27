import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
  constructor(private prisma: PrismaService) { }

  create(createPromocionDto: CreatePromocionDto) {
    return this.prisma.promocion.create({ data: createPromocionDto });
  }

  findAll() {
    return this.prisma.promocion.findMany();
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    try {
      return await this.prisma.promocion.update({
        where: { id },
        data: updatePromocionDto,
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar la promoción con ID ${id}`);
    }
  }

  async findOne(id: number) {
    const promo = await this.prisma.promocion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    return promo;
  }

  async remove(id: number) {
    // Soft-delete: adelantamos fecha_fin al pasado para que deje de ser activa
    try {
      return await this.prisma.promocion.update({
        where: { id },
        data: { fecha_fin: new Date('2000-01-01T00:00:00Z') },
      });
    } catch {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }
  }
}