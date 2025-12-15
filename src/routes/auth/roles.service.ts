import { Injectable } from '@nestjs/common'
import RoleName from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RolesService {
  private clientRoldeId: number | null = null
  //Dependency Injection: không cần khởi tạo instance PrismaService mà vẫn có thể sử dụng được các phương thức của nó thông qua DI của NestJS
  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    //check đã có clientRoleId chưa
    //**Cái query bên dưới chỉ chạy một lần duy nhất thôi
    //còn những lần sau sẽ lấy từ biến cục bộ luôn nếu đã có rồi
    if (this.clientRoldeId) {
      return this.clientRoldeId
    }
    //Đánh Muốn tìm theo name thì phải là findfirst.
    //còn em muốn dùng findUnique thì cột đó của em phải là khóa chính hoặc đánh unique mới dùng được.
    const role = await this.prismaService.role.findUniqueOrThrow({
      //name là unique trong db của bảng role
      where: { name: RoleName.Client },
    })

    //Nếu mà tìm được thì gán vào biến cục bộ luôn
    this.clientRoldeId = role.id
    return role.id
  }
}
