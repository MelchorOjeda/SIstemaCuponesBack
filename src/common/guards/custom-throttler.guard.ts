
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    private readonly logger = new Logger('ThrottlerDebug');

    protected async shouldSkipAttribute(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Obtener IP real considerando proxies (X-Forwarded-For)
        const xForwardedFor = request.headers['x-forwarded-for'];
        const ip = (typeof xForwardedFor === 'string' ? xForwardedFor.split(',')[0].trim() : xForwardedFor?.[0]) 
                  || request.ip 
                  || request.connection.remoteAddress;

        this.logger.warn(`PETICIÓN RECIBIDA DESDE IP: ${ip}`);

        const ipsPermitidas = ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost', '192.168.1.41'];
        
        // Limpiar prefijo IPv6 si existe
        const cleanIp = ip.replace(/^::ffff:/, '');

        // Bypass total si es IP local O si es una petición DELETE desde IP local
        if (ipsPermitidas.includes(ip) || ipsPermitidas.includes(cleanIp)) {
            this.logger.log(`✅ Bypass Throttler para IP: ${ip} (${request.method} ${request.url})`);
            return true;
        }

        this.logger.warn(`⚠️ IP no permitida para bypass: ${ip}. Aplicando límites...`);
        return false;
    }
}