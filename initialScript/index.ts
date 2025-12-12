import envConfig from 'src/shared/config'
import RoleName from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

// File này sẽ được sử dụng để khởi tạo dữ liệu ban đầu cho cơ sở dữ liệu
//mình sẽ chạy file này một lần duy nhất để tạo các role mặc định và user admin
//mình sẽ custom lệnh để chaỵ file này trong package.json

const prisma = new PrismaService()
const hashingService = new HashingService()

const main = async () => {
  // Đếm xem có bao nhiu role trong bảng roles
  const roleCount = await prisma.role.count()
  // Nếu mà có role rồi thì mình sẽ không tạo nữa
  //giúp tránh việc chạy script này nhiều lần tạo dư thừa dữ liệu
  if (roleCount > 0) {
    throw new Error('Roles already exist in the database.')
  }
  // Chưa thì sẽ tiến hành tạo các role mặc định

  const roles = await prisma.role.createMany({
    data: [
      { name: RoleName.Admin, description: 'Admin role' },
      { name: RoleName.Client, description: 'Client role' },
      { name: RoleName.Seller, description: 'Seller role' },
    ],
  })

  // Tạo admin
  //b1: Lấy role admin vừa tạo
  const adminRole = await prisma.role.findFirstOrThrow({
    where: { name: RoleName.Admin },
  })
  //hash password admin
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  //b2: Tạo user admin
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })
  return {
    createRoleCount: roles.count,
    adminUser,
  }
}

//Chạy hàm main
main()
  .then(({ adminUser, createRoleCount }) => {
    console.log(`Created ${createRoleCount} roles`)
    console.log(`Create admin user: ${adminUser.email}`)
  })
  .catch((error) => {
    console.error('Error during initial script execution:', error)
  })
