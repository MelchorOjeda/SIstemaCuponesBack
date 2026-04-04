import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkipAttribute(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;

        const ipsPermitidas = ['::1', '127.0.0.1'];
        return ipsPermitidas.includes(ip);
    }
}