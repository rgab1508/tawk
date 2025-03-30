import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../shared/queues/kafka/kafka.service';
import { AppConfigService } from '../../shared/config/app-config/app-config.service';
import { MessagesSearchWorkerService } from './messages-search-worker.service';
import { KafkaTopics } from '../../shared/queues/kafka/constants/topics';

@Controller()
export class MessagesSearchWorkerController implements OnModuleInit {
  private readonly logger = new Logger(MessagesSearchWorkerController.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly appConfigService: AppConfigService,
    private readonly messagesSearchWorkerService: MessagesSearchWorkerService,
  ) {
    this.logger.log(
      `Initialized MessagesController with topic: ${KafkaTopics.MESSAGES_INSERTED}`,
    );
  }
  async onModuleInit() {
    await this.setupMessagesSearchWorkerConsumer();
  }

  private async setupMessagesSearchWorkerConsumer() {
    try {
      await this.kafkaService.consumeBatch({
        topic: KafkaTopics.MESSAGES_INSERTED,
        groupId: this.appConfigService.kafkaConfigGroupId,
        batchHandler: async ({ messages, topic, partition }) => {
          this.logger.log(`Processing batch of ${messages.length} messages`);

          await this.messagesSearchWorkerService.processBatch({
            messages,
          });

          this.logger.log(
            `Successfully processed batch of ${messages.length} messages`,
          );
        },
      });

      this.logger.log('Message consumer setup completed');
    } catch (error) {
      this.logger.error('Failed to setup message consumer:', error);
      throw error;
    }
  }
}
