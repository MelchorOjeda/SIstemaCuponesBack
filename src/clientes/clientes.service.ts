import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) { }

  async create(createClienteDto: CreateClienteDto) {
    const { correo, nombre, telefono, cumpleanios } = createClienteDto;

    const clienteExistente = await this.prisma.cliente.findUnique({
      where: { correo },
    });

    if (clienteExistente) {
      throw new BadRequestException('Este correo ya está registrado, puedes seguir participando en futuras promociones.');
    }

    return this.prisma.cliente.create({
      data: {
        nombre,
        correo,
        telefono,
        cumpleanios,
      },
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