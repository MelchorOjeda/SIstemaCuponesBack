import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClienteDto {
    @ApiProperty({ 
        example: 'Melchor Torres', 
        description: 'Nombre completo del cliente' 
    })
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @ApiProperty({ 
        example: 'melchor@test.com', 
        description: 'Correo electrónico único para el registro' 
    })
    @IsEmail()
    @IsNotEmpty()
    correo!: string;

    @ApiProperty({ 
        example: '9981234567', 
        description: 'Teléfono de contacto (opcional)',
        required: false 
    })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({ 
        example: '12/12/1990',
        description: 'Fecha de nacimiento del cliente (opcional)',
        required: false 
    })
    @IsString()
    @IsOptional()
    cumpleanios?: string;
}