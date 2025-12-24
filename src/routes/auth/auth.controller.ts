import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GoogleAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
} from './auth.dto'
import { AuthService } from './auth.service'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GoogleService } from './google.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}
  @Post('register')
  @IsPublic()
  //Serialize dữ liệu trả về cho client
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    console.log('controller...')
    return await this.authService.register(body)
  }

  //Khai báo route gửi OTP
  @Post('otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  //Api này sẽ giúp chúng ta lấy link đăng nhập với google
  //Frontend sẽ call api này để lấy link và redirect user sang google để đăng nhập
  //**Server sẽ tạo link bởi vì mình muốn khi login vì phải có thêm một số thông tin như user-agent, ip
  //nên phải do server tạo. Sau khi client bấm nút login thì sẽ gửi đồng thời user-agent, ip lên server để server tạo link
  //sau đó link này server trả về cho client và client redirect user sang google
  //Google sẽ xử lý đăng nhập và sau khi đăng nhập xong sẽ redirect về lại server của mình, thì nó gửi lại ngoài các thông tin của google
  //còn có thêm ip, user-agent chúng ta đính kèm trong link mà server tạo lúc đầu
  //***Lúc này server sẽ nhận được các thông tin như user-agent, ip, do google trả về trong state
  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GoogleAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }
}
