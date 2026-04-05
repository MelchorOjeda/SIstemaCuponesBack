import { Controller, Post, Body, Get, Patch, Param, ParseIntPipe, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { RegistroYCuponDto } from './dto/registro-y-cupon.dto';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) { }

  @Post('generar')
  @ApiOperation({ summary: 'Registra al cliente y genera su cupón en un solo paso' })
  create(
    @Body() dto: RegistroYCuponDto,
    @Ip() ip: string
  ) {
    return this.cuponesService.registrarYGenerar(dto, ip);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de todos los cupones asignados' })
  findAll() {
    return this.cuponesService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  @ApiResponse({ status: 200, description: 'Cupón actualizado con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuponDto: UpdateCuponDto
  ) {
    return this.cuponesService.update(id, updateCuponDto);
  }
}