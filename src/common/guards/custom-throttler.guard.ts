import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkipAttribute(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;

        // Whitelist de IPs de desarrollo
        const ipsPermitidas = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
        if (ipsPermitidas.includes(ip)) return true;

        return false;
    }
}