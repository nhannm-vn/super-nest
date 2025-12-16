import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-user.model'

//File này dùng để khai báo repository chung (những method) dùng chung cho nhiều route khác nhau
//chứ nếu không xài file này thì cứ để trong từng repository của module đó nhưng nó sẽ không hay

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  //Đây sẽ là method dùng chung để tìm user theo email hoặc id
  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}
