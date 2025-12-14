import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { isUniqueConstraintPrismaError } from '../helpers'

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    // Nếu mà cái lỗi nó là HttpException thì lấy status từ nó còn không thì trả về 500
    let httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error'

    if (isUniqueConstraintPrismaError(exception)) {
      httpStatus = HttpStatus.CONFLICT
      message = 'Record already exists'
    }
    // Tạo response body chung cho tất cả các lỗi
    const responseBody = {
      statusCode: httpStatus,
      message,
    }
    console.log('ahhihi CatchEverythingFilter: ', exception)
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
