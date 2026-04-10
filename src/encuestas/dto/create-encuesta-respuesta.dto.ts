import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RespuestaDetalleDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    id_pregunta!: number;

    @ApiProperty({ example: 3, required: false })
    @IsOptional()
    @IsInt()
    id_opcion?: number;

    @ApiProperty({ example: 'Me encantó la mermelada de mora', required: false })
    @IsOptional()
    @IsString()
    respuesta_texto?: string;
}

export class CreateEncuestaRespuestaDto {
    @ApiProperty({ example: 'Melchor Ojeda' })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ example: 'melchor@ejemplo.com' })
    @IsEmail()
    correo!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    id_encuesta!: number;

    @ApiProperty({ type: [RespuestaDetalleDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RespuestaDetalleDto)
    respuestas!: RespuestaDetalleDto[];
}