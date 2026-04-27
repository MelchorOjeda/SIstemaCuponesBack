import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePromocionDto {
    @ApiProperty({ example: 'Bebida gratis' })
    @IsString() @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ example: 'Válido solo en consumo de alimentos', required: false })
    @IsString() @IsOptional()
    descripcion?: string;

    @ApiProperty({ example: '2026-12-31T23:59:59Z' })
    @IsString() @IsNotEmpty()
    fecha_fin!: string;

    @ApiProperty({ example: 'Monto o Porcentaje', required: false })
    @IsString() @IsOptional()
    tipo_descuento!: string;

    @ApiProperty({ example: 55, required: false })
    @IsOptional()
    valor!: number;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    id_campania_grupo?: number;

    @ApiProperty({ example: [1, 2], required: false })
    @IsOptional()
    sucursales?: number[];

    @ApiProperty({ example: 'ACTIVA', required: false })
    @IsString() @IsOptional()
    estado?: string;
}