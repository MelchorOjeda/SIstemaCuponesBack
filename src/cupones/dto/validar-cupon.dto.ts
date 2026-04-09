import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidarCuponDto {
    @ApiProperty({ example: 'SQRABCD' })
    @IsString()
    @Length(7, 7)
    codigo!: string;
}