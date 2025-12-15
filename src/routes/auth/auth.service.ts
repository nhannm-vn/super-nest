import { ConflictException, Injectable } from '@nestjs/common'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { HashingService } from 'src/shared/services/hashing.service'
import { RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { RolesService } from './roles.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    // Giúp mình không phải query roleId mỗi lần đăng ký client
    private readonly rolesService: RolesService,
    // Repository
    private readonly authRepository: AuthRepository,
  ) {}
  //**register phải dùng async vì nó gọi đến các hàm bất đồng bộ
  //**dùng async-await thì dùng try-catch
  async register(body: RegisterBodyType) {
    try {
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
      //NestJS đã có sẵn ConflictException (HTTP 409) để báo lỗi trùng dữ liệu.
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email already exists')
      }
      //500
      throw error
    }
  }

  // async login(body: any) {
  //   //Validate email có nằm trong database và password có khớp hay không
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       email: body.email,
  //     },
  //   })

  //   if (!user) {
  //     throw new UnauthorizedException('Account is not exist')
  //   }

  //   const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
  //   if (!isPasswordMatch) {
  //     //Mình muốn 422 để người dùng thấy dưới ô nhập password luôn
  //     throw new UnprocessableEntityException([
  //       {
  //         field: 'password',
  //         error: 'Password is incorrect',
  //       },
  //     ])
  //   }

  //   const tokens = await this.generateTokens({ userId: user.id })
  //   //Sau khi xác thực email và password thành công thì tiến hành ký 2 token
  //   //và trả ra cho người dùng
  //   return tokens
  // }

  // //Method giúp ký token và lưu vào trong database
  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ])
  //   //*Decode để lấy thời điểm hết hạn
  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
  //   //Lưu vào trong db
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: payload.userId,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   })

  //   return { accessToken, refreshToken }
  // }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     //1. Kiểm tra token có đúng và hợp lệ hay không
  //     const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
  //     //2. Kiểm tra refreshToken có tồn tại trong database không
  //     //findUniqueOrThrow: thằng này khi có lỗi sẽ throw ra lỗi còn thằng findUnique
  //     //chỉ return về null
  //     await this.prismaService.refreshToken.findUniqueOrThrow({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     //3. Tiến hành xóa token cũ
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     //4. Tiến hành tạo mới access_token và refresh_token
  //     return await this.generateTokens({ userId: userId })
  //   } catch (error) {
  //     //Trường hợp đã refreshToken rồi hãy thông báo cho user biết
  //     //refreshToken đã bị đánh cắp (nghĩa là refreshToken của họ không còn trong db)
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     //Dành cho các lỗi chung chung
  //     throw new UnauthorizedException()
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     //1. Kiểm tra token có đúng và hợp lệ hay không
  //     await this.tokenService.verifyRefreshToken(refreshToken)
  //     //2. Xóa refreshToken trong database
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })
  //     return { message: 'Logout successfully' }
  //   } catch (error) {
  //     //Trường hợp đã refreshToken rồi hãy thông báo cho user biết
  //     //refreshToken đã bị đánh cắp (nghĩa là refreshToken của họ không còn trong db)
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     //Dành cho các lỗi chung chung
  //     throw new UnauthorizedException()
  //   }
  // }
}
