import { Module } from '@nestjs/common';
import { QrDynamicService } from './qr-dynamic.service';
import { QrDynamicController } from './qr-dynamic.controller';
import { PrismaModule } from '../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule],
  controllers: [QrDynamicController],
  providers: [QrDynamicService],
})
export class QrDynamicModule { }