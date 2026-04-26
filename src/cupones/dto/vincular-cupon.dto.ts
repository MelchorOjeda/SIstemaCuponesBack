import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { RegistroYCuponDto } from './registro-y-cupon.dto';

export class VincularCuponDto extends RegistroYCuponDto {
    @ApiProperty({ example: 5 })
    @IsInt()
    @IsNotEmpty()
    id_promocion!: number;
}