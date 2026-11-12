
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "sarthak.demo@example.com",
    },
    update: {},
    create: {
      name: "Sarthak Jaiswal",
      email: "sarthak.demo@example.com",
      passwordHash: "demo-only-not-a-valid-password-hash",
    },
  });

  console.log("Demo user ready:");
  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
