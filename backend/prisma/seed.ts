import path from "node:path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  DeliveryMode,
  PrismaClient,
  UserStatus
} from "@prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const prisma = new PrismaClient();
const password = "1234";
const oldDemoEmails = ["mery.demo@perchi.local", "barbie.demo@perchi.local"];

const users = [
  {
    email: "b.mery.vasquez@gmail.com",
    name: "Mery Vasquez",
    city: "Santiago",
    commune: "Santiago",
    bio: "Parte de la comunidad Perchi. Publica prendas seleccionadas de su closet.",
    deliveryMode: DeliveryMode.PRESENCIAL_ENVIO
  },
  {
    email: "3arbie.urm@gmail.com",
    name: "Barbie Urm",
    city: "Santiago",
    commune: "Puente Alto",
    bio: "Miembro de Perchi. Closet con prendas urbanas y accesorios.",
    deliveryMode: DeliveryMode.ENVIO
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(password, 12);
  const monthlyFeeClp = Number(process.env.MONTHLY_FEE_CLP ?? 6990);

  await prisma.user.deleteMany({
    where: { email: { in: oldDemoEmails } }
  });

  for (const userSeed of users) {
    const user = await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        name: userSeed.name,
        passwordHash,
        city: userSeed.city,
        commune: userSeed.commune,
        bio: userSeed.bio,
        deliveryMode: userSeed.deliveryMode,
        status: UserStatus.ACTIVE,
        communityRole: "MEMBER"
      },
      create: {
        email: userSeed.email,
        name: userSeed.name,
        passwordHash,
        city: userSeed.city,
        commune: userSeed.commune,
        bio: userSeed.bio,
        deliveryMode: userSeed.deliveryMode,
        status: UserStatus.ACTIVE,
        communityRole: "MEMBER"
      }
    });

    await prisma.listing.deleteMany({
      where: { sellerId: user.id }
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { active: true, monthlyFeeClp, provider: "mock" },
      create: { userId: user.id, active: true, monthlyFeeClp, provider: "mock" }
    });
  }

  console.log("Seed listo: usuarias de prueba creadas sin publicaciones falsas.");
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
