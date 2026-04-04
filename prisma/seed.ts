import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Empezando el sembrado de datos...');

    const mermelada = await prisma.sucursal.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nombre: 'Mermelada Cancún',
            ubicacion: 'Av. Huayacán',
            activo: true,
        },
    });

    const sucursal2 = await prisma.sucursal.upsert({
        where: { id: 2 },
        update: {},
        create: {
            nombre: 'Restaurante CQR Centro',
            ubicacion: 'Centro Histórico',
            activo: true,
        },
    });

    console.log('✅ Datos creados:', { mermelada, sucursal2 });
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });