import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// File này khai báo và xuất một thể hiện của PrismaClient sử dụng adapter PostgreSQL
//các file khác sẽ import prisma từ đây để tương tác với cơ sở dữ liệu PostgreSQL
//nghĩa là toàn bộ ứng dụng sẽ dùng chung một kết nối PrismaClient để tương tác với DB

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });
