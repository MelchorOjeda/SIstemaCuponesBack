import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail, IsNotEmpty, IsOptional, IsString,
    IsInt, Matches, Length, Max
} from 'class-validator';

export class RegistroYCuponDto {
    @ApiProperty({ example: 'Melchor Torres' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        message: 'El nombre solo puede contener letras y espacios'
    })
    nombre!: string;

    @ApiProperty({ example: 'correo@ejemplo.com' })
    @IsEmail({}, { message: 'El formato del correo no es válido' })
    @IsNotEmpty()
    @Length(5, 100)
    correo!: string;

    @ApiProperty({ example: '9981234567', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10}$/, {
        message: 'El teléfono debe ser de exactamente 10 dígitos numéricos'
    })
    telefono?: string;

    @ApiProperty({ example: '1995-03-12', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'La fecha debe tener el formato AAAA-MM-DD'
    })
    cumpleanios?: string;

    @ApiProperty({ example: 1 })
    @IsInt({ message: 'El ID de sucursal debe ser un número entero' })
    @Max(100) 
    id_sucursal!: number;
}