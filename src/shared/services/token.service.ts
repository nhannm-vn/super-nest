import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import envConfig from '../config'
import {
  AccessTokenPayloadCreate,
  AccessTokenPayloadDecode,
  RefreshTokenPayloadCreate,
  RefreshTokenPayloadDecode,
} from '../types/jwt.type'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenPayloadCreate) {
    return this.jwtService.signAsync({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    } as any)
  }

  signRefreshToken(payload: RefreshTokenPayloadCreate) {
    return this.jwtService.signAsync({ ...payload, uuid: uuidv4() }, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
      //đảm bảo hai thiết bị của cùng một người dùng không thể tạo ra hai
      //token giống hệt nhau, ngay cả khi chúng gửi yêu cầu trong cùng một giây.
      //tóm lại giúp refresh_token tạo ra unique
      // jwtid: crypto.randomUUID(),
    } as any)
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayloadDecode> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayloadDecode> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
