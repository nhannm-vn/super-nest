import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RegisterBodyType, UserType } from './auth.model'

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
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
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
}
