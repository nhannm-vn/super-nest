import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'

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
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
