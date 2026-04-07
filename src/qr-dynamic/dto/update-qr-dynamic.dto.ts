import { PartialType } from '@nestjs/swagger';
import { CreateQrDynamicDto } from './create-qr-dynamic.dto';

export class UpdateQrDynamicDto extends PartialType(CreateQrDynamicDto) {}
