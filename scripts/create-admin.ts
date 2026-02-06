import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { role: 'admin', password: hashedPassword },
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  })
  
  console.log('✅ Admin user created/updated successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email: admin@test.com')
  console.log('🔑 Password: admin123')
  console.log('👤 Role:', user.role)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
