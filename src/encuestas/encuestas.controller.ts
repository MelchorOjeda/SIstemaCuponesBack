import { Controller, Post, Body, Get, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EncuestasService } from './encuestas.service';
import { CreateEncuestaRespuestaDto } from './dto/create-encuesta-respuesta.dto';
import { CreateEncuestaDto } from './dto/create-encuesta.dto';
import { Throttle } from '@nestjs/throttler';


@ApiTags('Encuestas')
@Controller('encuestas')
export class EncuestasController {
  constructor(private readonly encuestasService: EncuestasService) { }

  @Post()
  @SkipThrottle()
  @ApiOperation({ summary: 'Crear una nueva encuesta con preguntas y opciones' })
  crear(@Body() dto: CreateEncuestaDto) {
    return this.encuestasService.crearEncuesta(dto);
  }

  @Post('responder')
  @Throttle({ publico: { limit: 2, ttl: 1800000 } })
  @ApiOperation({ summary: 'Guardar respuestas de un cliente (aplica Upsert en Cliente)' })
  @ApiResponse({ status: 201, description: 'Respuestas guardadas y registro completado.' })
  responder(@Body() dto: CreateEncuestaRespuestaDto) {
    return this.encuestasService.guardarRespuestas(dto);
  }

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: '[Admin] Listar todas las encuestas' })
  findAll() {
    return this.encuestasService.findAll();
  }

  @Get(':id')
  @Throttle({ lecturas: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Obtener encuesta por ID para mostrarla en el Front' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.encuestasService.getEncuestaActiva(id);
  }

  @Delete(':id')
  @SkipThrottle()
  @ApiOperation({ summary: '[Admin] Eliminar una encuesta y todos sus datos' })
  @ApiResponse({ status: 200, description: 'Encuesta eliminada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.encuestasService.remove(id);
  }
}