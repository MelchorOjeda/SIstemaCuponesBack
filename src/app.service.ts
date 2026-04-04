import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hola estamos en fase de desarrollo, por favor ten paciencia con los errores que puedan surgir y no dudes en reportarlos para que podamos corregirlos lo antes posible. ¡Gracias por tu comprensión! ';
  }
}
