import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import { OTPEmail } from '../../../emails/otp'
import React from 'react'

// Vì thằng service này của riêng bên thư viện Resend nên mình tách riêng ra 1 service
//mặc khác mình để bên shared/services cho tiện tái sử dụng nếu cần ở những chỗ khác

// Giúp đọc file html template, sau khi đọc thì nó trả về 1 chuỗi string
// const otpTemplate = fs.readFileSync(path.resolve('src/shared/email-templates/otp.html'), {
//   encoding: 'utf-8',
// })

@Injectable()
export class EmailService {
  private resend: Resend
  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  //Send otp email
  sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP xác thực tài khoản'
    return this.resend.emails.send({
      from: 'Ecommerce <onboarding@resend.dev>',
      //Đây là mail mình xài dịch vụ sandbox. Vì mình chỉ demo chưa mua host
      //nên chỉ gửi mail đến đúng địa chỉ đã khai báo trong sandbox
      to: [envConfig.RESEND_EMAIL_SEND_TO],
      subject: subject,
      react: <OTPEmail code={payload.code} title={subject} />,
      // html: otpTemplate.replaceAll('{{code}}', payload.code).replaceAll('{{subject}}', subject),
    })
  }
}
