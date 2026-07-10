import bcrypt from "bcryptjs";
import { prisma } from "./lib/db";

async function main() {
  const email = "test@dalo.app";
  const password = "test123456";
  const passwordHash = await bcrypt.hash(password, 10);

  const before = await prisma.customer.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      active: true,
      passwordHash: true,
    },
  });

  console.log("Before:", {
    id: before?.id,
    email: before?.email,
    active: before?.active,
    hasPasswordHash: Boolean(before?.passwordHash),
  });

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      passwordHash,
      active: true,
    },
    create: {
      email,
      passwordHash,
      active: true,
    },
  });

  const passwordWorks = await bcrypt.compare(password, customer.passwordHash || "");

  console.log("After:", {
    id: customer.id,
    email: customer.email,
    active: customer.active,
    hasPasswordHash: Boolean(customer.passwordHash),
    passwordWorks,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
