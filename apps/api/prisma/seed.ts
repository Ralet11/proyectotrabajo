import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { slug: 'cerrajeros', name: 'Cerrajeros', description: 'Aperturas, cambios de cerradura y urgencias.' },
  { slug: 'plomeros', name: 'Plomeros', description: 'Pérdidas, instalaciones y reparaciones sanitarias.' },
  { slug: 'electricistas', name: 'Electricistas', description: 'Instalaciones, tableros y urgencias eléctricas.' },
  { slug: 'gasistas', name: 'Gasistas', description: 'Instalaciones y mantenimiento habilitado.' },
  { slug: 'albaniles', name: 'Albañiles', description: 'Arreglos, refacciones y obras menores.' },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

