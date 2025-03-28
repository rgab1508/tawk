import { UseCase } from '../../../../shared/interfaces/use-case';
import { Injectable } from '@nestjs/common';
import {
  CreateMessageRequestV1,
  CreateMessageResponseV1,
} from '../../interfaces/create-message.interface';
import { MessagesService } from '../../services/messages.service';

@Injectable()
export class CreateMessageUseCase
  implements UseCase<CreateMessageRequestV1, CreateMessageResponseV1>
{
  constructor(private readonly messagesService: MessagesService) {}

  execute(request: CreateMessageRequestV1): Promise<CreateMessageResponseV1> {
    return this.messagesService.createMessage(request);
  }
}
