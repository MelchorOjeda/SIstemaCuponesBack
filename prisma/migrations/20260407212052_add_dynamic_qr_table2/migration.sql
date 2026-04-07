-- AlterTable
ALTER TABLE "DynamicQR" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QRVisit" (
    "id" SERIAL NOT NULL,
    "qrId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRVisit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QRVisit" ADD CONSTRAINT "QRVisit_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "DynamicQR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
