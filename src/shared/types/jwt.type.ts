// Định nghĩa cho kiểu dữ liệu gửi lên khi tạo token
export interface AccessTokenPayloadCreate {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface RefreshTokenPayloadCreate {
  userId: number
}

//*Định nghĩa kiểu dữ liệu khi decode token
export interface AccessTokenPayloadDecode extends AccessTokenPayloadCreate {
  exp: number
  iat: number
  uuid: string
}

export interface RefreshTokenPayloadDecode extends RefreshTokenPayloadCreate {
  exp: number
  iat: number
  uuid: string
}
