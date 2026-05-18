import prisma from '../data/connection.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing data to prevent duplicate key crashes
  await prisma.message.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create the global default chat room
  const defaultGroup = await prisma.group.create({
    data: {
      name: 'General Chat Room',
      isDefault: true,
    },
  });
  console.log(`✅ Default group created: "${defaultGroup.name}"`);

  // 3. Encrypt the starter user's password safely
  const plainTextPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!'; 
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

  // 4. Create the first user with the encrypted password
  const firstUser = await prisma.user.create({
    data: {
      username: 'admin_user',
      email: 'admin@messenger.com',
      password: hashedPassword, // Storing the secure hash, never the plain text!
      groups: {
        connect: { id: defaultGroup.id },
      },
    },
  });
  console.log(`✅ First user created: "${firstUser.username}" with encrypted password.`);

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });