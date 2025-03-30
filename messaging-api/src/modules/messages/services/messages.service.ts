import { Injectable } from '@nestjs/common';
import {
  CreateMessageRequestV1,
  CreateMessageResponseV1,
} from '../interfaces/create-message.interface';
import { KafkaService } from '../../../shared/queues/kafka/kafka.service';
import { KafkaTopics } from '../../../shared/queues/kafka/constants/topics';

@Injectable()
export class MessagesService {
  constructor(private readonly kafkaService: KafkaService) {}

  async createMessage(
    request: CreateMessageRequestV1,
  ): Promise<CreateMessageResponseV1> {
    await this.kafkaService.sendMessages({
      topic: KafkaTopics.CREATE_MESSAGE,
      messages: [
        {
          key: request.conversationId,
          value: JSON.stringify({
            ...request,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return {
      success: true,
      message: 'Message enqueued successfully.',
    };
  }
}
