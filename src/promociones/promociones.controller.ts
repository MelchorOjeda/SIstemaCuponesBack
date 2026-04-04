import { Controller, Get, Post, Patch, Param, ParseIntPipe, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@ApiTags('Promociones')
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly service: PromocionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo registro' })
  create(@Body() dto: CreatePromocionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos' })
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una promoción existente' })
  @ApiResponse({ status: 200, description: 'Promoción actualizada con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePromocionDto: UpdatePromocionDto
  ) {
    return this.service.update(id, updatePromocionDto);
  }
}