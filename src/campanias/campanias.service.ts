import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaniaDto } from './dto/create-campania.dto';
import { UpdateCampaniaDto } from './dto/update-campania.dto';

@Injectable()
export class CampaniasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCampaniaDto) {
    return this.prisma.campaniaGrupo.create({ data: dto });
  }

  findAll() {
    return this.prisma.campaniaGrupo.findMany({
      include: {
        _count: { select: { promociones: true } }
      }
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.campaniaGrupo.findUnique({
      where: { id },
      include: { promociones: true }
    });
    if (!item) throw new NotFoundException(`Campaña #${id} no encontrada`);
    return item;
  }

  async update(id: number, dto: UpdateCampaniaDto) {
    try {
      return await this.prisma.campaniaGrupo.update({
        where: { id },
        data: dto
      });
    } catch {
      throw new NotFoundException(`Campaña #${id} no encontrada`);
    }
  }

  async remove(id: number) {
    try {
      // Nota: Al ser hard-delete, Prisma fallará si hay promociones asociadas
      // Se podría implementar una lógica de "mover a generales" o simplemente impedir el borrado si hay promos.
      return await this.prisma.campaniaGrupo.delete({ where: { id } });
    } catch {
      throw new Error(`No se puede eliminar la campaña #${id}. Asegúrate de que no tenga promociones asociadas.`);
    }
  }
}
