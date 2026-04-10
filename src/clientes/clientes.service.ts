import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) { }

async upsertCliente(dto: CreateClienteDto, tx?: any) {
    const prisma = tx || this.prisma;
    const { correo, nombre, telefono, cumpleanios } = dto;

    return prisma.cliente.upsert({
        where: { correo },
        update: { nombre, telefono, cumpleanios: cumpleanios ? new Date(cumpleanios) : null },
        create: { correo, nombre, telefono, cumpleanios: cumpleanios ? new Date(cumpleanios) : null },
    });
}

  findAll() {
    return this.prisma.cliente.findMany();
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      return await this.prisma.cliente.update({
        where: { id },
        data: updateClienteDto,
      });
    } catch (error) {
      throw new Error(`No se pudo encontrar el cliente con ID ${id}`);
    }
  }
}