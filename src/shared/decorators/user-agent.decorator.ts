import { createParamDecorator, ExecutionContext } from '@nestjs/common'

// Custom decorator này dùng để lấy thông tin User-Agent từ header của request
//thay vì phải truy cập trực tiếp vào request trong mỗi controller
// **Custom decorator trong nestjs là một hàm đặc biệt giúp bạn trích xuất dữ liệu từ request một cách dễ dàng và
// tái sử dụng trong nhiều controller khác nhau.**

export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  // Lấy thông tin User-Agent từ header của request
  return request.headers['user-agent']
})
