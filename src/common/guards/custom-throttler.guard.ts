
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    private readonly logger = new Logger('ThrottlerDebug');

    protected async shouldSkipAttribute(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        this.logger.warn(`PETICIÓN RECIBIDA DESDE IP: ${ip}`);

        const ipsPermitidas = ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost', '192.168.1.41'];

        if (ipsPermitidas.includes(ip)) {
            this.logger.log('IP Blanca detectada - Saltando Throttler');
            return true;
        }

        return false;
    }
}