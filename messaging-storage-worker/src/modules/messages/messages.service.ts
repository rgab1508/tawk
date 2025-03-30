import { Injectable } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { MessagesRepository } from '../../infra/setup/databases/mongodb/repositories/messages.repository';
import { parseJSON } from '../../shared/utils/common';
import { Messages } from '../../infra/setup/databases/mongodb/entities/messages.entity';
import { KafkaService } from '../../shared/queues/kafka/kafka.service';
import { KafkaTopics } from '../../shared/queues/kafka/constants/topics';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async storeBatch({ messages }: { messages: KafkaMessage[] }) {
    const parsedMessages: Messages[] = messages
      .map((message) => {
        const messageValue = message.value?.toString();
        return messageValue ? parseJSON(messageValue) : null;
      })
      .filter(Boolean);

    if (!parsedMessages.length) {
      return;
    }

    await this.messagesRepository.insertMany(parsedMessages);

    // Publish for creating elastic search index
    await this.kafkaService.sendMessages({
      topic: KafkaTopics.MESSAGES_INSERTED,
      messages: parsedMessages.map(
        ({ id, conversationId, content, timestamp }) => ({
          value: JSON.stringify({
            id,
            conversationId,
            content,
            timestamp,
          }),
        }),
      ),
    });
  }
}
