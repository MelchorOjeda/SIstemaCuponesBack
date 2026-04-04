import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@ApiTags('Empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) { }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo empleado (mesero/cajero)' })
  @ApiResponse({ status: 201, description: 'Empleado creado correctamente.' })
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los empleados' })
  findAll() {
    return this.empleadosService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un empleado existente' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado con éxito.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto
  ) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }
}