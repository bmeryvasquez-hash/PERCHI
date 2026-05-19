-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('PRESENCIAL', 'ENVIO', 'PRESENCIAL_ENVIO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'PRESENCIAL_ENVIO';
