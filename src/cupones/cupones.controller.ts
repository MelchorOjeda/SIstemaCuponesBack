import { Controller, Post, Body, Get, Patch, Param, ParseIntPipe, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { RegistroYCuponDto } from './dto/registro-y-cupon.dto';
import { CanjearCuponDto } from './dto/canjear-cupon.dto';
import { ValidarCuponDto } from './dto/validar-cupon.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) { }

  @Post('generar')
  @Throttle({ publico: { limit: 2, ttl: 1800000 } })
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

  @Post('validar-info')
  @Throttle({ staff: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener información del cupón antes de canjear' })
  validarInfo(@Body() dto: ValidarCuponDto) {
    return this.cuponesService.obtenerInfoParaCanje(dto.codigo);
  }

  @Post('canjear')
  @Throttle({ staff: { limit: 20, ttl: 60000 } })  
  @ApiOperation({ summary: 'Canjea el cupón validando empleado y sucursal' })
  canjear(@Body() dto: CanjearCuponDto) {
    return this.cuponesService.canjear(dto);
  }

}