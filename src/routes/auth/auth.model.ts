import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

//Đây là file định nghĩa model cho User sử dụng zod để validate dữ liệu
//Những dữ liệu nào mà gửi lên thì thêm strict để không cho phép gửi thừa dữ liệu

//****Còn các type dùng định nghĩa kiểu TypeScript trong file service và repository thì không cần strict

// Định nghĩa schema cho dữ liệu đăng ký lúc gửi lên
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
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

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

// Định nghĩa schema cho dữ liệu trả về sau khi đăng ký(Serialize)
export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type RegisterResType = z.infer<typeof RegisterResSchema>

// Đinh nghĩa schema cho Verification Body OTP khi đăng ký
// Định nghĩa chung
export const VerificationCode = z.object({
  id: z.number(),
  email: z.string().pipe(z.email()),
  code: z.string().length(6),
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export type VerificationCodeType = z.infer<typeof VerificationCode>

// Định nghĩa schema cho body gửi OTP, nghĩa là người dùng gửi lên gì để nhận OTP
export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict()

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
