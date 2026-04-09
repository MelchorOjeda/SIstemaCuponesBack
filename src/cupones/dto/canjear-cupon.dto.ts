import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

export class CanjearCuponDto {
    @ApiProperty({ example: 'SQRABCD' })
    @IsString()
    @IsNotEmpty()
    @Length(7, 7, { message: 'El código debe tener exactamente 7 caracteres' })
    codigo!: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    id_empleado!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    id_sucursal!: number;
}