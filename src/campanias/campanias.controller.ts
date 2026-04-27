import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CampaniasService } from './campanias.service';
import { CreateCampaniaDto } from './dto/create-campania.dto';
import { UpdateCampaniaDto } from './dto/update-campania.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Campañas')
@Controller('campanias')
@SkipThrottle()
export class CampaniasController {
  constructor(private readonly campaniasService: CampaniasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva campaña' })
  create(@Body() createCampaniaDto: CreateCampaniaDto) {
    return this.campaniasService.create(createCampaniaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las campañas' })
  findAll() {
    return this.campaniasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una campaña por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una campaña' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCampaniaDto: UpdateCampaniaDto) {
    return this.campaniasService.update(id, updateCampaniaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una campaña' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.campaniasService.remove(id);
  }
}
