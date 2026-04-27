import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCampaniaDto {
    @ApiProperty({ example: 'Campaña Navideña' })
    @IsString() @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ example: 'Promociones para diciembre', required: false })
    @IsString() @IsOptional()
    descripcion?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean() @IsOptional()
    excluyente?: boolean;
}
