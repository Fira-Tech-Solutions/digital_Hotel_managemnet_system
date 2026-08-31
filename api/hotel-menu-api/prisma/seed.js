require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hotelName = process.env.SEED_HOTEL_NAME || 'Adama Hotel';
  const ownerEmail = process.env.SEED_OWNER_EMAIL || 'owner@example.com';
  const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'ChangeMe123!';

  console.log('Seeding database...');

  const hotel = await prisma.hotel.create({
    data: {
      name: hotelName,
      slug: hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: 'A boutique hotel experience in the heart of Adama.',
      contactEmail: 'info@example.com',
      languages: ['en', 'am', 'om'],
      theme: {
        create: {
          templateId: 'classic-grid',
          primaryColor: '#1c1c1c',
          secondaryColor: '#c9a24b',
          backgroundColor: '#faf7f2',
          fontFamily: 'Inter',
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash(ownerPassword, 10);
  await prisma.staff.create({
    data: {
      hotelId: hotel.id,
      name: 'Hotel Owner',
      email: ownerEmail,
      passwordHash,
      role: 'OWNER',
    },
  });

  const starters = await prisma.category.create({
    data: { hotelId: hotel.id, name: 'Starters', sortOrder: 0 },
  });
  const mains = await prisma.category.create({
    data: { hotelId: hotel.id, name: 'Mains', sortOrder: 1 },
  });
  const drinks = await prisma.category.create({
    data: { hotelId: hotel.id, name: 'Drinks', sortOrder: 2 },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: starters.id,
      name: 'Sambusa Trio',
      description: 'Crisp pastry parcels filled with spiced lentils, served with mint chutney.',
      price: 4.5,
      isAvailable: true,
      dietaryTags: ['VEGETARIAN'],
      sortOrder: 0,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: mains.id,
      name: 'Doro Wat',
      description: 'Slow-simmered chicken in berbere sauce, served with injera.',
      price: 12.0,
      isAvailable: true,
      isChefSpecial: true,
      dietaryTags: ['SPICY'],
      sortOrder: 0,
      customizationGroups: {
        create: [
          {
            name: 'Spice Level',
            isRequired: true,
            allowMultiple: false,
            options: {
              create: [
                { label: 'Mild', priceDelta: 0 },
                { label: 'Medium', priceDelta: 0 },
                { label: 'Hot', priceDelta: 0 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: drinks.id,
      name: 'Ethiopian Coffee Ceremony (Single Serve)',
      description: 'Traditionally brewed coffee, roasted fresh to order.',
      price: 3.0,
      isAvailable: true,
      sortOrder: 0,
    },
  });

  const table1 = await prisma.table.create({ data: { hotelId: hotel.id, number: '1' } });
  await prisma.table.create({ data: { hotelId: hotel.id, number: '2' } });
  await prisma.table.create({ data: { hotelId: hotel.id, number: '3' } });

  console.log('Seed complete.');
  console.log(`  Hotel: ${hotel.name} (${hotel.id})`);
  console.log(`  Owner login: ${ownerEmail} / ${ownerPassword}`);
  console.log(`  Sample table QR token: ${table1.qrToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
