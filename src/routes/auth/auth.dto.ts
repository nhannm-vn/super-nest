import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

//File này giúp định nghĩa các schema dùng để validate dữ liệu trong các route liên quan đến xác thực (auth)

//strict nghĩa là không được chấp nhận các trường gửi lên không được định nghĩa trong schema
const RegisterBodySchema = z
  .object({
    email: z.string().pipe(z.email()),
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(9).max(15),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'], // dùng path để chỉ ra trường nào bị lỗi khi báo lỗi
      })
    }
  })

//Khai báo class DTO dùng để validate dữ liệu đăng ký
export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
