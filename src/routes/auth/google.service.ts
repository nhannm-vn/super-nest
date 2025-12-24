import { Injectable } from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import envConfig from 'src/shared/config'
import { GoogleAuthStateType } from './auth.model'

@Injectable()
export class GoogleService {
  private oauth2Client: OAuth2Client
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      envConfig.GOOGLE_CLIENT_ID,
      envConfig.GOOGLE_CLIENT_SECRET,
      envConfig.GOOGLE_REDIRECT_URI,
    )
  }

  getAuthorizationUrl({ userAgent, ip }: GoogleAuthStateType) {
    //Khai báo phạm vi truy cập thông tin người dùng vào tài khoản gg của người dùng
    const scope = [
      'https://www.googleapis.com/auth/userinfo.profile', //
      'https://www.googleapis.com/auth/userinfo.email',
    ]
    //Chuyển đổi thông tin thành base64 để gửi kèm trong url an toàn
    //Mình hoán đổi object sang string rồi chuyển sang base64 để bỏ lên url cho an toàn
    const stateString = Buffer.from(JSON.stringify({ userAgent, ip })).toString('base64')

    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', //Yêu cầu cấp quyền truy cập lâu dài
      scope,
      include_granted_scopes: true, //Cho phép cấp quyền truy cập mở rộng
      state: stateString,
    })

    return { url }
  }
}
