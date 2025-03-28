import { Body, Controller, Post } from '@nestjs/common';
import { CreateMessageUseCase } from '../../use-cases/v1/create-message.use-case';
import { CreateMessageBodyDto } from '../../dtos/v1/create-message.dto';

@Controller('api/messages')
export class MessagesController {
  constructor(private readonly createMessageUseCase: CreateMessageUseCase) {}

  @Post()
  createMessage(@Body() request: CreateMessageBodyDto) {
    return this.createMessageUseCase.execute(request);
  }
}
