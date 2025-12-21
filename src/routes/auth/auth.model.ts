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
    //Thì khi đăng ký ngoài confirmPassword thì còn có otp gửi lên thêm để tiến hành verify tài khoản
    //nghĩa là khi người dùng muốn đăng ký thì phải nhập mã OTP đã gửi về email để xác thực
    //và sau bước xác thực code mới được phép đăng ký, còn nếu không có code hoặc code sai thì không được đăng ký
    code: z.string().length(6), // OTP
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
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().pipe(z.email()),
  code: z.string().length(6),
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

// Định nghĩa schema cho body gửi OTP, nghĩa là người dùng gửi lên gì để nhận OTP
export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

//Tạo model Login
export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export type LoginBodyType = z.infer<typeof LoginBodySchema>

//Tạo model trả về sau khi login thành công
export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginResType = z.infer<typeof LoginResSchema>

//Tạo schema cho body gửi lên thực hiện chức năng refresh token
export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

//Tạo schema cho dữ liệu trả về sau khi thực hiện refresh token
export const RefreshTokenResSchema = LoginResSchema

export type RefreshTokenResType = LoginResType

// Tạo schema cho device
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
})

export type DeviceType = z.infer<typeof DeviceSchema>

// Tạo schema cho Role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type RoleType = z.infer<typeof RoleSchema>
