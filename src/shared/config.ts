import * as z from 'zod'
import fs from 'fs'
//module của Node.js dùng để làm việc với file.
import path from 'path'
import { config } from 'dotenv'

//config.ts nhằm load file .env và validate các biến môi trường
//để tránh việc khai báo sai tên biến hoặc thiếu biến trong file .env
//sử dụng zod để validate
config({
  path: '.env',
})

// Kiểm tra coi thử có file env hay chưa
//nếu không có thì thoát luôn
if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

//*Class này đại diện cho schema của file env
//nhằm kiểm tra tính hợp lệ của file env
//để tránh việc khai báo sai tên biến hoặc thiếu biến

const configSchema = z.object({
  DATABASE_URL: z.string(),
  SECRET_API_KEY: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
})

//Thằng này sẽ parse obj process.env dựa trên schema đã định nghĩa
//giúp mình có được obj đúng kiểu đã định nghĩa trong schema
//lúc này configServer sẽ là obj có kiểu đúng như schema đã định nghĩa
const configServer = configSchema.safeParse(process.env)

//Sau đó sẽ tiến hành check lỗi theo zod
//nếu mà có lỗi thì in ra và thoát luôn
if (!configServer.success) {
  console.log('Các giá trị khai báo trong .env không hợp lệ:')
  console.error(configServer.error)
  process.exit(1)
}

const envConfig = configServer.data
//*Thằng envConfig này vì đã được chuyển thành obj của chính xác
//instance nào rồi nên đem qua sử dụng ở các file khác gọi ý một cách dễ dàng
export default envConfig

//***Mục đích của file config này giúp cho env viết đúng theo schema
//đồng thời xài ở các file khác thì nó sẽ gợi ý tránh mình phải copy tên
//biến môi trường sai. Nếu sai thì sẽ bị lỗi ngay khi khởi động app chứ không phải chạy mới bị lỗi.
//Giúp tiết kiệm thời gian debug */
