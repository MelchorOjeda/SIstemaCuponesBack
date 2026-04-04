-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "ubicacion" VARCHAR(255),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpleadoSucursal" (
    "id_empleado" INTEGER NOT NULL,
    "id_sucursal" INTEGER NOT NULL,
    "rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "EmpleadoSucursal_pkey" PRIMARY KEY ("id_empleado","id_sucursal")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(15),
    "cumpleanios" VARCHAR(10),

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaniaGrupo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "excluyente" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CampaniaGrupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" SERIAL NOT NULL,
    "id_campania_grupo" INTEGER,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo_descuento" VARCHAR(50) NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromocionSucursal" (
    "id_promocion" INTEGER NOT NULL,
    "id_sucursal" INTEGER NOT NULL,

    CONSTRAINT "PromocionSucursal_pkey" PRIMARY KEY ("id_promocion","id_sucursal")
);

-- CreateTable
CREATE TABLE "CuponAsignado" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_promocion" INTEGER NOT NULL,
    "id_sucursal_canje" INTEGER,
    "id_empleado_canje" INTEGER,
    "codigo_unico" VARCHAR(7) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_canje" TIMESTAMP(3),

    CONSTRAINT "CuponAsignado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_correo_key" ON "Cliente"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "CuponAsignado_codigo_unico_key" ON "CuponAsignado"("codigo_unico");

-- AddForeignKey
ALTER TABLE "EmpleadoSucursal" ADD CONSTRAINT "EmpleadoSucursal_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoSucursal" ADD CONSTRAINT "EmpleadoSucursal_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promocion" ADD CONSTRAINT "Promocion_id_campania_grupo_fkey" FOREIGN KEY ("id_campania_grupo") REFERENCES "CampaniaGrupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromocionSucursal" ADD CONSTRAINT "PromocionSucursal_id_promocion_fkey" FOREIGN KEY ("id_promocion") REFERENCES "Promocion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromocionSucursal" ADD CONSTRAINT "PromocionSucursal_id_sucursal_fkey" FOREIGN KEY ("id_sucursal") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuponAsignado" ADD CONSTRAINT "CuponAsignado_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuponAsignado" ADD CONSTRAINT "CuponAsignado_id_promocion_fkey" FOREIGN KEY ("id_promocion") REFERENCES "Promocion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuponAsignado" ADD CONSTRAINT "CuponAsignado_id_sucursal_canje_fkey" FOREIGN KEY ("id_sucursal_canje") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuponAsignado" ADD CONSTRAINT "CuponAsignado_id_empleado_canje_fkey" FOREIGN KEY ("id_empleado_canje") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
