import { SetMetadata } from '@nestjs/common'
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from '../constants/auth.constant'

export const AUTH_TYPE_KEY = 'authType'

export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

// Decorator để gán metadata cho các route về loại xác thực
//nó sẽ giúp các guard xác định loại xác thực nào được yêu cầu cho route đó
//tóm lại nó giúp guard biết route đó cần loại xác thực nào và cách thức áp dụng (AND/OR)
export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
  //Ý nghĩa: nếu a khác null và undefined thì lấy a, còn nếu a là null hoặc undefined thì lấy b.
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } })
}

// Decorator để đánh dấu route là công khai, không yêu cầu xác thực
export const IsPublic = () => Auth([AuthType.None])
