import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResSchema, SendOTPBodySchema } from './auth.model'

//Serialize dữ liệu User trả về cho client
//đối với Serialize thì không cần .email các kiểu
//chỉ cần lượt bỏ những trường không cần thiết

//*Lưu ý: khi validate dữ liệu trả về cho client thì không cần strict
//vì thí dụ server gửi về có bị dư thì không gây lỗi
//còn nếu strict thì dữ liệu dư sẽ bị lỗi vì yêu cầu dữ liệu phải đúng y như schema định nghĩa
// const UserSchema = z.object({
//   id: z.number(),
//   email: z.string(),
//   name: z.string(),
//   phoneNumber: z.string(),
//   avatar: z.string().nullable(),
//   status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
//   roleId: z.number(),
//   createdById: z.number().nullable(),
//   updatedById: z.number().nullable(),
//   deletedAt: z.date().nullable(),
//   createdAt: z.date(),
//   updatedAt: z.date(),
// })

//File này giúp định nghĩa các schema dùng để validate dữ liệu trong các route liên quan đến xác thực (auth)

//strict nghĩa là không được chấp nhận các trường gửi lên không được định nghĩa trong schema
// const RegisterBodySchema = z
//   .object({
//     email: z.string().pipe(z.email()),
//     password: z.string().min(6).max(100),
//     name: z.string().min(1).max(100),
//     confirmPassword: z.string().min(6).max(100),
//     phoneNumber: z.string().min(9).max(15),
//   })
//   .strict()
//   .superRefine(({ confirmPassword, password }, ctx) => {
//     if (confirmPassword !== password) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'Password and confirm password do not match',
//         path: ['confirmPassword'], // dùng path để chỉ ra trường nào bị lỗi khi báo lỗi
//       })
//     }
//   })

//****Các DTO này sử dụng trong controller để validate dữ liệu gửi lên và trả về

//Định nghĩa DTO cho dữ liệu đăng ký
export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
//Định nghĩa DTO cho dữ liệu trả về sau khi đăng ký
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
//Định nghĩa DTO cho dữ liệu gửi OTP
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
