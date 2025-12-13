import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe, ZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

//**Guard là gì?
//Sẽ chạy trước Pipe và sau middleware
//Dùng để authorize, xác thực người dùng
//cho phép hay không cho phép truy cập vào route nào đó
//"Người này có quyền truy cập vào route này không?"

//**Pipe là gì?
//Sẽ chạy trước khi dữ liệu được truyền vào controller
//Có thể dùng để validate, transform dữ liệu đầu vào
//"Tao chỉ nhận dữ liệu đúng định dạng thôi nhé"

//**Filter là gì?
//Sẽ chạy sau khi có exception xảy ra trong controller hoặc service
//Dùng để bắt exception và trả về response phù hợp
//"Lỗi rồi nè, tao sẽ xử lý và trả về cho mày sao cho client hiểu được"

//Mình sẽ custom lại cách xử lý lỗi validation, path trong lỗi sẽ được chuyển thành chuỗi để dễ đọc hơn
const CustomZodValidationPipe: typeof ZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    //Phiên bản mới thì errors thay bằng issues
    // console.log(error.issues)
    return new UnprocessableEntityException(
      error.issues.map((error) => {
        return {
          ...error,
          path: error.path.join('.'), // biến path thành chuỗi để dễ đọc hơn
        }
      }),
    )
  },
})

export default CustomZodValidationPipe

/**
Request(Yêu cầu)
  ↓
Middleware(Lưới lọc)
  ↓
GUARD(Khiên bảo vệ)
  ↓
INTERCEPTOR (before)
  ↓
PIPE(xử lý dữ liệu validate, transform)
  ↓
Controller(đón nhận yêu cầu)
  ↓
Service(xử lý nghiệp vụ)
  ↓
INTERCEPTOR (after)
  ↓
Response
        Exception
          ↓
        FILTER
 */

/*
Guard |	Mày có được vào không?
Pipe  |	Dữ liệu có đúng không?
Interceptor |	Trước & sau tao làm gì thêm?
Filter|	Lỗi thì tao nói sao?
*/
