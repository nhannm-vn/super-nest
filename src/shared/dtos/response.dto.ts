// Mình sẽ tạo một file DTO dùng chung cho toàn bộ project
//đây là DTO để định nghĩa các response trả về chỉ có message đơn giản
//những thằng này sẽ dùng chung cho các route khác nhau trong project

import { createZodDto } from 'nestjs-zod'
import { MessageResSchema } from '../models/response.model'

export class MessageResDTO extends createZodDto(MessageResSchema) {}
