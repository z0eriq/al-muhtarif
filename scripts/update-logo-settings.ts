import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.update({
    where: { id: "main" },
    data: {
      logo: "/logo.png",
      favicon: "/logo-icon.png",
    },
  });
  console.log("Logo settings updated");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
