import { Controller, Post, Body, Get, Patch, Param, ParseIntPipe, Ip, Delete } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CuponesService } from './cupones.service';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';
import { RegistroYCuponDto } from './dto/registro-y-cupon.dto';
import { VincularCuponDto } from './dto/vincular-cupon.dto';
import { CanjearCuponDto } from './dto/canjear-cupon.dto';
import { ValidarCuponDto } from './dto/validar-cupon.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Cupones')
@Controller('cupones')
export class CuponesController {
  constructor(private readonly cuponesService: CuponesService) { }

  // ---------------------------------------------------------------------------
  // PASO 1: El Gancho — devuelve promoción aleatoria; valida IP sin escribir en DB
  // ---------------------------------------------------------------------------
  @Get('sorteo-inicial/:id_sucursal')
  // 🛡️ PRODUCCIÓN: Máximo 5 intentos de sorteo por IP al día
  @Throttle({ publico: { limit: 5, ttl: 86400000 } })
  @ApiOperation({ summary: 'Obtiene una promoción aleatoria para mostrar en el raspadito (sin registro)' })
  @ApiResponse({ status: 200, description: 'Promoción seleccionada para la sucursal' })
  @ApiResponse({ status: 400, description: 'IP ya participó hoy' })
  obtenerSorteoInicial(
    @Param('id_sucursal', ParseIntPipe) idSucursal: number,
    @Ip() ip: string,
  ) {
    return this.cuponesService.obtenerSorteoInicial(idSucursal, ip);
  }

  // ---------------------------------------------------------------------------
  // PASO 3: La Entrega — recibe datos del lead + id_promocion; crea cupón en DB
  // ---------------------------------------------------------------------------
  @Post('vincular-registro')
  // 🛡️ PRODUCCIÓN: Máximo 5 registros/cupones por IP al día
  @Throttle({ publico: { limit: 5, ttl: 86400000 } })
  @ApiOperation({ summary: 'Registra el lead y vincula el cupón al id_promocion obtenido en el sorteo inicial' })
  @ApiResponse({ status: 201, description: 'Cupón generado exitosamente' })
  vincularRegistro(
    @Body() dto: VincularCuponDto,
    @Ip() ip: string,
  ) {
    return this.cuponesService.vincularRegistro(dto, ip);
  }

  // ---------------------------------------------------------------------------
  // Endpoint legacy (mantenido por compatibilidad)
  // ---------------------------------------------------------------------------
  @Post('generar')
  @Throttle({ publico: { limit: 2, ttl: 1800000 } })
  @ApiOperation({ summary: '[Legacy] Registra al cliente y genera su cupón en un solo paso' })
  create(
    @Body() dto: RegistroYCuponDto,
    @Ip() ip: string,
  ) {
    return this.cuponesService.registrarYGenerar(dto, ip);
  }

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'Obtener historial de todos los cupones asignados' })
  findAll() {
    return this.cuponesService.findAll();
  }

  @Get('estadisticas/por-dia')
  @SkipThrottle()
  @ApiOperation({ summary: '[Admin] Estadísticas de cupones generados vs canjeados por día (30 días)' })
  estadisticasPorDia() {
    return this.cuponesService.estadisticasPorDia();
  }

  @Patch(':id')
  @SkipThrottle()
  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  @ApiResponse({ status: 200, description: 'Cupón actualizado con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuponDto: UpdateCuponDto,
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

  @Delete(':id')
  @SkipThrottle()
  @ApiOperation({ summary: '[Admin] Cancelar un cupón (soft-delete: estado → CANCELADO)' })
  @ApiResponse({ status: 200, description: 'Cupón cancelado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cuponesService.remove(id);
  }
}