import { PartialType } from '@nestjs/swagger';
import { CreateEncuestaDto } from './create-encuesta.dto';

export class UpdateEncuestaDto extends PartialType(CreateEncuestaDto) {}
