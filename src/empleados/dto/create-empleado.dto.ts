import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEmpleadoDto {
    @ApiProperty({ example: 'Melchor Torres' })
    @IsString() @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ example: '1234', description: 'PIN de 4 dígitos para canje' })
    @IsString() @IsNotEmpty()
    contrasena!: string;
}