/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'src/generated/prisma/client'
import envConfig from 'src/shared/config'

// File này khai báo và xuất một thể hiện của PrismaClient sử dụng adapter PostgreSQL
//các file khác sẽ import prisma từ đây để tương tác với cơ sở dữ liệu PostgreSQL
//nghĩa là toàn bộ ứng dụng sẽ dùng chung một kết nối PrismaClient để tương tác với DB

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: envConfig.DATABASE_URL,
    })
    super({ adapter, log: ['query', 'info', 'warn', 'error'] })
  }

  //cách để báo lỗi kết nối DB ngay khi ứng dụng khởi động
  async onModuleInit() {
    try {
      console.log('Testing database connection...')
      await this.$connect()
      // Test bằng query thực
      await this.$queryRaw`SELECT 1`
    } catch (error) {
      console.error('Database connection failed:', error?.message)
      throw error // Throw để app không start nếu DB sai
    }
  }
}
