import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo cliente en el sistema' })
  @ApiResponse({ status: 201, description: 'Cliente creado con éxito.' })
  @ApiResponse({ status: 400, description: 'El correo ya existe o los datos son inválidos.' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todos los clientes registrados' })
  findAll() {
    return this.clientesService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cliente existente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }
}