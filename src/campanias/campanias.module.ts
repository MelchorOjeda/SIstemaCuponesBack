import { Module } from '@nestjs/common';
import { CampaniasService } from './campanias.service';
import { CampaniasController } from './campanias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampaniasController],
  providers: [CampaniasService],
  exports: [CampaniasService],
})
export class CampaniasModule {}
