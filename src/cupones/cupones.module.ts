import { Module } from '@nestjs/common';
import { CuponesService } from './cupones.service';
import { CuponesController } from './cupones.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientesService } from 'src/clientes/clientes.service';
import { ClientesModule } from 'src/clientes/clientes.module';

@Module({
  imports: [PrismaModule, ClientesModule],
  controllers: [CuponesController],
  providers: [CuponesService],
  exports: [CuponesService],
})
export class CuponesModule {}
