import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateSucursalDto {
    @ApiProperty({ example: 'Mermelada Kabah' })
    @IsString() @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ example: 'Av. Kabah con Holbox' })
    @IsString() @IsNotEmpty()
    ubicacion!: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    activo!: boolean;
}