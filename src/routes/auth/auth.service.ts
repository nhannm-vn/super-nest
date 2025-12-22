import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { RolesService } from './roles.service'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import ms, { StringValue } from 'ms'
import envConfig from 'src/shared/config'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant'
import { EmailService } from 'src/shared/services/email.service'
import { TokenService } from 'src/shared/services/token.service'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'

@Injectable()
export class AuthService {
  constructor(
    // Generate token JWT
    private readonly tokenService: TokenService,
    // Giúp mình hash và so sánh mật khẩu
    private readonly hashingService: HashingService,
    // Giúp mình không phải query roleId mỗi lần đăng ký client
    private readonly rolesService: RolesService,
    // Repository
    private readonly authRepository: AuthRepository,
    // Repository shared dùng chung cho nhiều module
    private readonly sharedUserRepository: SharedUserRepository,
    // Email service
    private readonly emailService: EmailService,
  ) {}
  //**register phải dùng async vì nó gọi đến các hàm bất đồng bộ
  //**dùng async-await thì dùng try-catch
  async register(body: RegisterBodyType) {
    try {
      // *Trước khi đăng ký thì phải kiểm tra mã OTP đã đúng chưa còn hạn không
      // Tìm xem có mã OTP nào khớp với email, code, type không
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
        code: body.code,
      })
      // Nếu như mà không có thì mình sẽ throw lỗi
      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Invalid OTP code',
            path: 'code',
          },
        ])
      }
      // Kiểm tra nếu có mã OTP mà mã OTP đã hết hạn
      //nếu mà thời gian hết hạn < thời gian hiện tại thì là hết hạn
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'OTP code has expired',
            path: 'code',
          },
        ])
      }

      //*Sau khi đã verify OTP thành công thì tiến hành tạo user mới

      // Service lấy roleId của client từ bảng roles, nhờ có nó mà không phải query nhiều lần
      const clientRoleId = await this.rolesService.getClientRoleId()
      // hash password trước khi lưu vào db
      const hashedPassword = await this.hashingService.hash(body.password)
      // Service tạo user mới trong db thông qua AuthRepository
      //xài kiến trúc repository để thao tác với db
      return await this.authRepository.createUser({
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      })
    } catch (error) {
      //Khi đăng ký tài khoản mới mà nó dùng email đã tồn tại rồi để đăng ký
      //NestJS đã có sẵn ConflictException (HTTP 409) để báo lỗi trùng dữ liệu.
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException([
          {
            //Những thông tin này phải format theo zod validate cho đồng nhất
            message: 'Email is already registered',
            path: 'email',
          },
        ])
      }
      //500
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    //1. Kiểm tra email đã tồn tại trong hệ thống chưa
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    //Nếu tồn tại thì báo lỗi vì không thể gửi OTP cho email đã đăng ký
    if (user) {
      //Mình throw lỗi này để biết cụ thể trừng nào đang bị lỗi
      throw new UnprocessableEntityException([
        {
          //Những thông tin này phải format theo zod validate cho đồng nhất
          message: 'Email is already registered',
          path: 'email',
        },
      ])
    }
    //2. Tạo mã OTP
    const code = generateOTP()
    //3. Lưu mã OTP vào database, gọi tới repository để thao tác với db
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      // Thằng thư viện date-fns để cộng thêm thời gian | còn ms để chuyển chuỗi thời gian thành ms
      //nghĩa là vd "5m" => 300000 ms
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
    })
    //4. Gửi mã OTP vào email của user
    console.log(`OTP code for ${body.email}: ${code}`)
    const { error } = await this.emailService.sendOTP({
      email: body.email,
      code: code,
    })

    if (error) {
      console.log(error)
      throw new UnprocessableEntityException([
        {
          message: 'Failed to send OTP email',
          path: 'code',
        },
      ])
    }

    return verificationCode
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Tìm user dựa theo email
    //Mình không chỉ tìm user mà còn include cả role để có được roleName luôn
    //nên không xài sharedUserRepository được
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email })
    // Nếu không tìm thấy user thì báo lỗi
    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Email not exist in system',
          path: 'email',
        },
      ])
    }

    // Kiểm tra mật khẩu có khớp không
    // 2. So sánh mật khẩu gửi lên với mật khẩu đã hash trong db
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    // Nếu mật khẩu không khớp thì báo lỗi
    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          message: 'Password is incorrect',
          path: 'password',
        },
      ])
    }

    //Sau khi verify email và mật khẩu đúng thì tiến hành tạo record device
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    //3. Nếu email tồn tại và mật khẩu đúng thì tạo token (access & refresh)
    const tokens = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      deviceId: device.id,
    })

    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    // Song song tạo cả 2 token access và refresh
    const [accessToken, refreshToken] = await Promise.all([
      //Các thông tin truyền vào paload
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    // Decode refresh token để lấy thông tin về thời gian hết hạn
    const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    // Lưu refresh token vào db
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodeRefreshToken.exp * 1000), //exp là thời gian tính theo giây nên phải nhân 1000 để thành ms
      deviceId,
    })

    return { accessToken, refreshToken }
  }
}
