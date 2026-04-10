import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOpcionDto {
    @ApiProperty({ example: 'Excelente' })
    @IsString()
    @IsNotEmpty()
    texto_opcion!: string;
}

class CreatePreguntaDto {
    @ApiProperty({ example: '¿Qué te pareció nuestro servicio?' })
    @IsString()
    @IsNotEmpty()
    texto_pregunta!: string;

    @ApiProperty({ example: 'MULTIPLE', enum: ['MULTIPLE', 'ABIERTA', 'RATING'] })
    @IsEnum(['MULTIPLE', 'ABIERTA', 'RATING'])
    tipo_pregunta!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsOptional()
    orden!: number;

    @ApiProperty({ type: [CreateOpcionDto], required: false })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateOpcionDto)
    opciones?: CreateOpcionDto[];
}

export class CreateEncuestaDto {
    @ApiProperty({ example: 'Encuesta de Satisfacción Mermelada' })
    @IsString()
    @IsNotEmpty()
    titulo!: string;

    @ApiProperty({ example: 'Ayúdanos a mejorar y llévate un 10% de descuento.' })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({ type: [CreatePreguntaDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePreguntaDto)
    preguntas!: CreatePreguntaDto[];
}