import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "lipostylee@gmail.com";
  const plain = "12345"; // change later

  const passwordHash = await bcrypt.hash(plain, 10);

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  console.log("Seeded admin:", { id: user.id, email: user.email });
  console.log("Login with password:", plain);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
