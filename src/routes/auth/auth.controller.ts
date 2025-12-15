import { Body, Controller, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RegisterBodyDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  //Serialize dữ liệu trả về cho client
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    console.log('controller...')
    return await this.authService.register(body)
  }

  @Post('otp')
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  // @Post('login')
  // async login(@Body() body: any) {
  //   return this.authService.login(body)
  // }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // async refreshToken(@Body() body: any) {
  //   return this.authService.refreshToken(body.refreshToken)
  // }

  // @Post('logout')
  // async logout(@Body() body: any) {
  //   return this.authService.logout(body.refreshToken)
  // }
}
