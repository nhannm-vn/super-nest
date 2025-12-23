import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { APIKeyGuard } from './api-key.guard'
import { AuthType, ConditionGuard } from '../constants/auth.constant'

//***Thằng này là áp dụng cho các route nên sẽ khai báo global
//***Nó sẽ kiểm tra xem route đó yêu cầu loại xác thực nào và sử dụng guard tương ứng để kiểm tra
//**Nó hỗ trợ nhiều loại xác thực cho một route và có thể cấu hình điều kiện (AND/OR) để xác thực
//*Ví dụ: nếu một route yêu cầu cả Bearer và API Key, với điều kiện OR, thì chỉ cần một trong hai loại xác thực thành công là được phép truy cập
//*Ngược lại, nếu điều kiện là AND, thì cả hai loại xác thực phải thành công
//*Nếu route được đánh dấu là công khai (AuthType.None), thì không cần xác thực
//*Guard này sử dụng Reflector để lấy metadata đã được gán bởi decorator Auth hoặc IsPublic
//*Dựa vào loại xác thực yêu cầu, nó sẽ sử dụng các guard tương ứng (AccessTokenGuard, APIKeyGuard) để thực hiện kiểm tra
//*Nếu tất cả các kiểm tra thành công theo điều kiện đã định, người dùng sẽ được phép truy cập route
//*Nếu không, nó sẽ ném ra UnauthorizedException

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy metadata về loại xác thực từ decorator
    // Nếu không có metadata, mặc định là Bearer với điều kiện AND nghĩa là nếu route nào
    //mà không có decorator Auth hoặc IsPublic thì sẽ mặc định yêu cầu Bearer token
    //***Logic nếu nhiều route public thì không có decorator thì sẽ là public
    //còn nếu nhiều route private thì không có decorator thì sẽ là private

    //==> dự án mình nhiều route private hơn public nên để mặc định là Bearer
    //nghĩa là nếu không có decorator @IsPublic thì sẽ mặc định là private và cần check Bearer token
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])
    let error = new UnauthorizedException()
    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const instance of guards) {
        const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (canActivate) {
          return true
        }
      }
      throw error
    } else {
      for (const instance of guards) {
        const canActivate = await Promise.resolve(instance.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (!canActivate) {
          throw error
        }
      }
      return true
    }
  }
}
