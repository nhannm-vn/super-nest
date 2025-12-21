import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DeviceType, RegisterBodyType, RoleType, VerificationCodeType } from './auth.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { RefreshToken } from 'src/generated/prisma/client'

//Thực chất thì thằng này là service nhưng mình tách riêng ra để dễ quản lý
//Mấy thằng nào mà service để gọi theo dependency injection thì phải có @Injectable()

//*File này chỉ chuyên về thao tác với database liên quan đến auth (tách riêng ra cho dễ quản lý)
//theo kiến trúc repository pattern
//Thì sau này nếu mình có sửa đổi logic liên quan đến database thì chỉ cần sửa trong này
//nó không ảnh hưởng đến logic nghiệp vụ là auth.service.ts
//hoặc nếu có sử dụng ORM khác thì chỉ cần sửa trong này

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  //Type user khi tạo mới sẽ bỏ confirmPassword và thêm roleId
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: user,
      //Khi trả về chỉ trả những trường cần thiết, bỏ mấy trường nhạy cảm
      //kết hợp thằng này với DTO để serialize dữ liệu trả về client
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }
  // Tạo verify otp, repo này chỉ chuyên về thao tác với db, gọi tới prismaService
  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    //**Mình phải xử lí trường hợp nếu như người dùng gửi lại OTP thì
    //update cái mã OTP cũ thành mã mới chứ không tạo thêm bản ghi mới nữa
    return this.prismaService.verificationCode.upsert({
      //Tìm thằng đó dựa trên email
      where: {
        email: payload.email,
        type: payload.type,
      },
      //Nếu chưa tồn tại thì tạo mới
      create: payload,
      //Có rồi đã tồn tại thằng đó với email unique thì update
      //sẽ update lại code và expiresAt
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }
  // Tìm verify otp dựa trên các giá trị unique
  async findUniqueVerificationCode(
    uniqueValue:
      | { email: string }
      | { id: number }
      | {
          email: string
          code: string
          type: TypeOfVerificationCodeType
        },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }
  // Lưu refresh token vào db
  async createRefreshToken(data: {
    token: string
    userId: number
    expiresAt: Date
    deviceId: number
  }): Promise<RefreshToken> {
    return this.prismaService.refreshToken.create({
      data,
    })
  }

  // Tạo record device
  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'isActive' | 'lastActive'>>,
  ) {
    return this.prismaService.device.create({
      data,
    })
  }

  // Tìm user kèm role name dựa trên các giá trị unique
  //mình sẽ tìm ra user nhưng lúc trả về thì thêm cho nó role name
  async findUniqueUserIncludeRole(uniqueObject: { email: string } | { id: number }): Promise<
    | (UserType & {
        role: RoleType
      })
    | null
  > {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: true,
      },
    })
  }
}
