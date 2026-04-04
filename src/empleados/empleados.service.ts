import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) { }

  create(createEmpleadoDto: CreateEmpleadoDto) {
    return this.prisma.empleado.create({ data: createEmpleadoDto });
  }

  findAll() {
    return this.prisma.empleado.findMany();
  }

  async update(id: number, updateEmpleadoDto: UpdateEmpleadoDto) {
    try {
      return await this.prisma.empleado.update({
        where: { id },
        data: updateEmpleadoDto,
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar el empleado con ID ${id}`);
    }
  }
}