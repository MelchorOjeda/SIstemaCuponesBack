import { Controller, Get, Post, Patch, Param, ParseIntPipe, Body, Delete } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@ApiTags('Promociones')
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly service: PromocionesService) {}

  @Post()
  @SkipThrottle()
  @ApiOperation({ summary: 'Crear nuevo registro' })
  create(@Body() dto: CreatePromocionDto) {
    return this.service.create(dto);
  }

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Listar todos' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @SkipThrottle()
  @ApiOperation({ summary: 'Actualizar una promoción existente' })
  @ApiResponse({ status: 200, description: 'Promoción actualizada con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePromocionDto: UpdatePromocionDto
  ) {
    return this.service.update(id, updatePromocionDto);
  }

  @Get(':id')
  @SkipThrottle()
  @ApiOperation({ summary: 'Obtener una promoción por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @SkipThrottle()
  @ApiOperation({ summary: '[Admin] Soft-delete de promoción (fecha_fin → pasado)' })
  @ApiResponse({ status: 200, description: 'Promoción desactivada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}