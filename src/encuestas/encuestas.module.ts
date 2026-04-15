import { Module } from '@nestjs/common';
import { EncuestasService } from './encuestas.service';
import { EncuestasController } from './encuestas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientesModule } from '../clientes/clientes.module';
import { CuponesModule } from 'src/cupones/cupones.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [PrismaModule, ClientesModule, CuponesModule, ThrottlerModule],
  controllers: [EncuestasController],
  providers: [EncuestasService],
})
export class EncuestasModule { } 