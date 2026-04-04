import { Injectable } from '@nestjs/common';
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
}