import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateCuponDto {
    @ApiProperty({ example: 1, description: 'ID del cliente que ganó' })
    @IsInt()
    @IsNotEmpty()
    id_cliente!: number;

    @ApiProperty({ example: 2, description: 'ID de la sucursal donde está el cliente' })
    @IsInt()
    @IsNotEmpty()
    id_sucursal!: number;
}