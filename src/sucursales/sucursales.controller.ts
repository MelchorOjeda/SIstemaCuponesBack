import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';

@ApiTags('Sucursales')
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) { }

  @Post()
  @ApiOperation({ summary: 'Dar de alta una nueva sucursal (Mermelada/Autoctona)' })
  @ApiResponse({ status: 201, description: 'Sucursal registrada.' })
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalesService.create(createSucursalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las sucursales activas' })
  findAll() {
    return this.sucursalesService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sucursal existente' })
  @ApiResponse({ status: 200, description: 'Sucursal actualizada con éxito.' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSucursalDto: UpdateSucursalDto
  ) {
    return this.sucursalesService.update(id, updateSucursalDto);
  }
}