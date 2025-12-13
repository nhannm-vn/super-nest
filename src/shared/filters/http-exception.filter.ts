import { Logger, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { ZodSerializationException } from 'nestjs-zod'
import { ZodError } from 'zod'

//File này tạo một Exception Filter để bắt và xử lý các lỗi liên quan đến ZodSerializationException
//chức năng nó như một cái console.error để log lỗi ra console
//khi có lỗi liên quan đến ZodSerializationException xảy ra trong ứng dụng NestJS

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError()
      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`)
      }
    }

    super.catch(exception, host)
  }
}
