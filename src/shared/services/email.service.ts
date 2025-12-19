import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }
  //Send otp email
  sendOTP(payload: { email: string; code: string }) {
    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      //Đây là mail mình xài dịch vụ sandbox. Vì mình chỉ demo chưa mua host
      //nên chỉ gửi mail đến đúng địa chỉ đã khai báo trong sandbox
      to: [envConfig.RESEND_EMAIL_SEND_TO],
      subject: 'Mã OTP xác thực tài khoản',
      html: `<strong>${payload.code}</strong>`,
    })
  }
}
