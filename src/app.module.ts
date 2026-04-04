import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpleadosModule } from './empleados/empleados.module';
import { PromocionesModule } from './promociones/promociones.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CuponesModule } from './cupones/cupones.module';
import { ThrottlerModule } from '@nestjs/throttler/dist/throttler.module';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { APP_GUARD } from '@nestjs/core/constants';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    SucursalesModule,
    EmpleadosModule,
    ClientesModule,
    PromocionesModule,
    CuponesModule,
    PrismaModule,
    ThrottlerModule.forRoot([{
      ttl: 1800000, // Tiempo en milisegundos (30 mimutos)
      limit: 5,   // 5 solicitudes por IP
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard, 
    },
  ],
})
export class AppModule { }
