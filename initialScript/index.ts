import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()

const main = async () => {
  // Đếm xem có bao nhiu role trong bảng roles
  const roleCount = await prisma.role.count()
  // Nếu mà có role rồi thì mình sẽ không tạo nữa
  if (roleCount > 0) {
    throw new Error('Roles already exist in the database. Initial script should only be run on an empty database.')
  }
  // Chưa thì sẽ tiến hành tạo các role mặc định
  const roles = await prisma.role.createMany({
    data: [
      { name: 'ADMIN', description: 'Admin role' },
      { name: 'CLIENT', description: 'Client role' },
      { name: 'SELLER', description: 'Seller role' },
    ],
  })
}
