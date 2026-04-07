import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateQrDynamicDto {
    @IsString()
    slug!: string;

    @IsUrl()
    targetUrl!: string;

    @IsString()
    @IsOptional()
    description?: string;
}