import { Injectable } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { parseJSON } from '../../shared/utils/common';
import { ElasticsearchService } from '../../infra/setup/databases/elasticsearch/elasticsearch.service';
import { ElasticsearchIndex } from '../../infra/setup/databases/elasticsearch/constants/elasticsearch-index';

@Injectable()
export class MessagesSearchWorkerService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async processBatch({ messages }: { messages: KafkaMessage[] }) {
    const parsedMessages: {
      id: string;
      conversationId: string;
      content: string;
    }[] = messages
      .map((message) => {
        const messageValue = message.value?.toString();
        return messageValue ? parseJSON(messageValue) : null;
      })
      .filter(Boolean);

    if (!parsedMessages.length) {
      return;
    }

    await this.elasticsearchService.bulkUpsert({
      index: ElasticsearchIndex.MESSAGES,
      documents: parsedMessages,
      retryOnConflict: 3,
    });
  }
}
