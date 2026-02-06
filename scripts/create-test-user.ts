import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      password: hashedPassword, // Update password if user already exists
    },
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });
  
  console.log('✅ Test user created successfully!');
  console.log('');
  console.log('📧 Email: test@example.com');
  console.log('🔑 Password: test123');
  console.log('');
  console.log('User details:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
