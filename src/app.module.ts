import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Đăng ký ZodValidationPipe làm pipe toàn cục để tự động validate
    // dữ liệu đầu vào dựa trên các DTO sử dụng Zod
    // Ví dụ: trong AuthController, RegisterBodyDTO sẽ được tự động validate
    // **Nếu không khai báo pipe này, các DTO sẽ không được validate**
    // ngoài ra còn có thể dùng riêng từng pipe ở mỗi controller hoặc route gọi là local pipe
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    //*Đăng ký interceptor toàn cục để tự động serialize dữ liệu đầu ra
    //nghĩa là chuyển đổi dữ liệu thành định dạng phù hợp trước khi gửi về client
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    //*Đăng ký filter toàn cục để báo lỗi liên quan đến ZodSerializationException
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
  ],
})
export class AppModule {}
