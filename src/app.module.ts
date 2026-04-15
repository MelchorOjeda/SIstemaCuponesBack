import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpleadosModule } from './empleados/empleados.module';
import { PromocionesModule } from './promociones/promociones.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { CuponesModule } from './cupones/cupones.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { QrDynamicModule } from './qr-dynamic/qr-dynamic.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    SucursalesModule,
    EmpleadosModule,
    ClientesModule,
    PromocionesModule,
    CuponesModule,
    PrismaModule,

    ThrottlerModule.forRoot([{
      name: 'staff',
      ttl: 60000,   // 1 minuto
      limit: 10,    // 10 validaciones por minuto 
    }, {
      name: 'lecturas',
      ttl: 60000,   // 1 minuto
      limit: 10,    // 10 validaciones por minuto 
    },
    {
      name: 'publico',
      ttl: 1800000, // 30 minutos
      limit: 2,     // 2 solicitudes
    },]),
    QrDynamicModule,
    EncuestasModule,
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
