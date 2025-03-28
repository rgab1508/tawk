import { Injectable } from '@nestjs/common';
import {
  CreateMessageRequestV1,
  CreateMessageResponseV1,
} from '../interfaces/create-message.interface';
import { MessagesRepository } from '../../../infra/setup/databases/mongodb/repositories/messages.repository';
import { Messages } from '../../../infra/setup/databases/mongodb/entities/messages.entity';

@Injectable()
export class MessagesService {
  constructor(private readonly messagesRepository: MessagesRepository) {}

  async createMessage(
    request: CreateMessageRequestV1,
  ): Promise<CreateMessageResponseV1> {
    await this.messagesRepository.create({
      ...request,
      timestamp: new Date(),
    } as Messages);

    return {
      success: true,
      message: 'Message enqueued successfully.',
    };
  }
}
