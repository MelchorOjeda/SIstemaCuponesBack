import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) { }

  create(createSucursalDto: CreateSucursalDto) {
    return this.prisma.sucursal.create({ data: createSucursalDto });
  }

  findAll() {
    return this.prisma.sucursal.findMany();
  }

  async update(id: number, updateSucursalDto: UpdateSucursalDto) {
    try {
      return await this.prisma.sucursal.update({
        where: { id },
        data: updateSucursalDto,
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar la sucursal con ID ${id}`);
    }
  }
}